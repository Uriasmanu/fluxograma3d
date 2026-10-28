          // ---------- vans: deixam de ir até a subestação depois da explosão ----------
          const vanPathOriginal = vans.length ? vans[0].path : null;
          const vanDeliveredOriginal = vans.length ? vans[0].deliveredAt : 0;
          const vanPathDetour = makePath([[54, 23.0], [54, 18.5], [10, 18.5], [10, 20.5], [54, 20.5]], 'loop');
          const rerouteVans = (time, toDetour) => vans.forEach(van => {
            const target = toDetour ? vanPathDetour : vanPathOriginal;
            if (!target || van.path === target) return;
            const trav = time * van.speed + van.offset;
            const along = ((trav % van.path.total) + van.path.total) % van.path.total;
            if (along > 40) return;
            van.path = target;
            van.offset = along - time * van.speed;
            van.deliveredAt = toDetour ? 1e9 : vanDeliveredOriginal;
          });

          const ui = (force) => {
            let rem = 0;
            if (st.phase === 'countdown') rem = Math.max(0, Math.ceil(FAIL_SECONDS - st.t));
            if (st.phase === 'restoring') rem = Math.round(100 * Math.min(1, st.tr / RESTORE_SECONDS));
            const alertIdx = Math.floor(st.t / 3.2);
            if (!force && rem === st.lastRem && alertIdx === st.lastAlert) return;
            st.lastRem = rem;
            st.lastAlert = alertIdx;
            const stack = [];
            for (let i = 0; i < 3; i++) if (alertIdx - i >= 0 && st.phase === 'countdown') stack.push(ALERTS[(alertIdx - i) % ALERTS.length]);
            if (failureUiRef.current) failureUiRef.current({ phase: st.phase, remaining: rem, alerts: stack });
          };

          const setShown = (list, visible) => list.forEach(o => { o.visible = visible; });

          const explode = (time) => {
            st.phase = 'exploded';
            st.te = 0;
            st.cam = null;
            st.breakerDone = false;
            failureSim.exploded = true;
            trafoGroup.visible = false;
            setShown(attached, false);
            if (installer.props) installer.props.visible = false;
            wreck.visible = true;
            wreck.scale.set(1, 1, 1);
            wreckFires.forEach(f => {
              f.group.visible = true;
              f.amount = 1;
            });
            st.shake = 1;
            flash.style.transition = 'none';
            flash.style.opacity = '1';
            requestAnimationFrame(() => {
              flash.style.transition = 'opacity 1.4s ease-out';
              flash.style.opacity = '0';
            });
            for (let i = 0; i < 70; i++) launch(debris[i], rnd(-1.2, 1.2), rnd(1, 3.5), rnd(-1, 1), 17, 20);
            for (let i = 0; i < 60; i++) emit(sparkPool, rnd(-1, 1), rnd(1.5, 3), rnd(-1, 1), rnd(-14, 14), rnd(4, 18), rnd(-14, 14), rnd(0.8, 1.8), 1, 0, 1);
            for (let i = 0; i < 40; i++) emit(smokePool, rnd(-1.5, 1.5), rnd(1.5, 4), rnd(-1.5, 1.5), rnd(-3, 3), rnd(2, 6), rnd(-3, 3), rnd(4, 7), 1.2, 3.2, 0.7);
            collectVictims();
            particleSystemsRef.current.forEach(p => { p.visible = false; });
            ui(true);
          };

          const startCollapse = (c) => {
            c.started = true;
            c.tc = 0;
            for (let i = 0; i < 18; i++) emit(dustPool, c.wx + rnd(-2, 2), 0.8 + rnd(0, 3), c.wz + rnd(-2, 2), rnd(-2, 2), rnd(0.5, 3), rnd(-2, 2), rnd(2.5, 4.5), 1.5, 3.5, 0.65);
            const free = debris.slice(70).filter(p => p.rest || !p.mesh.visible);
            free.slice(0, 13).forEach(p => launch(p, c.wx + rnd(-1.5, 1.5), rnd(2, c.def.h), c.wz + rnd(-1.5, 1.5), 8, 12));
          };
