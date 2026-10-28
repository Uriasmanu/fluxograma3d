          // carros e pessoas perto da explosão: arremessados quando a onda de choque chega
          const HIT_R = 30;
          const victims = [];
          const carFires = Array.from({ length: 6 }, () => {
            const f = makeFire(root, 0, 0, 0, 0.9);
            f.used = false;
            return f;
          });
          const wp = V3(0, 0, 0);
          const collectVictims = () => {
            victims.length = 0;
            const add = (obj, kind, setHit) => victims.push({ obj, kind, setHit, hit: false, flying: false, t: 0, fire: null });
            walkers.forEach(w => add(w.group, 'person', v => { w.knocked = v; }));
            if (installer.rig) add(installer.rig, 'person', v => { installer.disabled = v; });
            vans.forEach(van => add(van.group, 'car', v => { van.hit = v; }));
            cityCars.forEach(car => add(car.group, 'car', v => { car.hit = v; }));
            cityPeople.forEach(p => add(p.group, 'person', v => { p.hit = v; }));
            nearby.forEach(e => add(e.group, e.walker ? 'person' : 'car', v => { e.hit = v; }));
          };
          const startFlight = (v, dist) => {
            const k = 1 - dist / HIT_R;
            const o = v.obj;
            v.hit = true;
            v.flying = true;
            v.t = 0;
            v.k = k;
            v.setHit(true);
            const away = V3(wp.x, 0, wp.z);
            if (away.lengthSq() < 0.01) away.set(1, 0, 0);
            v.dir = away.normalize();
            v.start = o.position.clone();
            v.startRot = o.rotation.clone();
            const car = v.kind === 'car';
            v.D = car ? 4 + 10 * k : 3 + 7 * k;
            v.H = car ? 1 + 3.5 * k : 0.8 + 2.2 * k;
            v.T = car ? 1.2 : 0.9;
            v.finalX = car ? (Math.random() < 0.5 ? 1 : -1) * 0.35 * k : -Math.PI / 2 * (Math.random() < 0.8 ? 1 : -1);
            v.finalZ = car ? (Math.random() < 0.5 ? 1 : -1) * (Math.random() < 0.4 ? Math.PI : Math.PI / 2) : 0;
            v.spinY = rnd(-1, 1) * (car ? 1.2 : 0.8) * Math.max(0.3, k);
          };
          const landVictim = (v) => {
            v.flying = false;
            v.obj.getWorldPosition(wp);
            for (let i = 0; i < 6; i++) emit(dustPool, wp.x + rnd(-0.6, 0.6), 0.3, wp.z + rnd(-0.6, 0.6), rnd(-1, 1), rnd(0.5, 1.8), rnd(-1, 1), rnd(1.5, 2.5), 0.6, 1.6, 0.5);
            if (v.kind === 'car' && v.k > 0.12) {
              const f = carFires.find(c => !c.used);
              if (f) {
                f.used = true;
                v.fire = f;
                f.group.position.set(wp.x, 0.5, wp.z);
                f.group.visible = true;
                f.amount = 1;
              }
              for (let i = 0; i < 10; i++) emit(sparkPool, wp.x, 0.6, wp.z, rnd(-4, 4), rnd(2, 6), rnd(-4, 4), rnd(0.4, 0.9), 1, 0, 1);
            }
          };
          const stepVictims = (dt, rr) => victims.forEach(v => {
            const o = v.obj;
            if (!v.hit) {
              o.getWorldPosition(wp);
              const dist = Math.hypot(wp.x, wp.z);
              if (dist <= HIT_R && rr >= dist) startFlight(v, dist);
              return;
            }
            if (v.flying) {
              v.t += dt / v.T;
              const u = Math.min(1, v.t);
              const e = 1 - (1 - u) * (1 - u);
              o.position.set(v.start.x + v.dir.x * v.D * e, v.start.y + v.H * 4 * u * (1 - u), v.start.z + v.dir.z * v.D * e);
              o.rotation.x = v.startRot.x + v.finalX * e + Math.sin(u * Math.PI) * 0.4 * v.k;
              o.rotation.z = v.startRot.z + v.finalZ * e;
              o.rotation.y = v.startRot.y + v.spinY * e;
              if (u >= 1) landVictim(v);
            } else if (v.fire && Math.random() < dt * 4) {
              o.getWorldPosition(wp);
              emit(smokePool, wp.x + rnd(-0.3, 0.3), 0.9, wp.z + rnd(-0.3, 0.3), rnd(0.2, 0.8), rnd(1.4, 2.6), rnd(-0.3, 0.3), rnd(3, 5), 0.5, 1.8, 0.55);
            }
          });
          const restoreVictims = (tr) => victims.forEach(v => {
            if (!v.hit) return;
            const o = v.obj;
            if (v.kind === 'person') {
              const e = 1 - ss(14, 15.6, tr);
              o.position.set(v.start.x + v.dir.x * v.D * e, v.start.y, v.start.z + v.dir.z * v.D * e);
              o.rotation.x = v.startRot.x + v.finalX * e;
            } else {
              o.scale.setScalar(Math.max(0.001, 1 - ss(11, 12, tr)));
            }
          });
          const releaseVictims = () => {
            victims.forEach(v => {
              if (!v.hit) return;
              const o = v.obj;
              if (v.kind === 'car') {
                o.rotation.x = 0;
                o.rotation.z = 0;
                o.scale.setScalar(1);
              } else {
                o.rotation.x = 0;
                o.rotation.z = 0;
              }
              if (o.userData.parked) o.position.copy(v.start);
              if (v.fire) v.fire.used = false;
              v.setHit(false);
              v.hit = false;
            });
            victims.length = 0;
          };
          const evac = [];
          plantSeated.forEach(s => evac.push({ obj: s.worker, at: rnd(2, FAIL_SECONDS - 4), back: rnd(8, 16) }));
          if (plantOfficeWalker.group) evac.push({ obj: plantOfficeWalker.group, at: rnd(2, FAIL_SECONDS - 4), back: rnd(8, 16) });
