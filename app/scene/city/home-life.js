        // 9c. VIDA NAS CASAS DA CIDADE: pessoinhas usando energia elétrica dentro e fora das casas
        const homeLife = { tickers: [], obstacles: [], persons: [], actors: [], lights: [], update: null, hooks: [], on: [], plotPos: [], curPlot: 0 };
        const homeKit = (() => {
          /* @include app/scene/city/home-life/kit-core.js */

          /* @include app/scene/city/home-life/indoor-scenes.js */

          /* @include app/scene/city/home-life/outdoor-scenes.js */

          /* @include app/scene/city/home-life/house.js */
        })();
        homeLife.plotOn = (idx) => {
          const pp = homeLife.plotPos[idx];
          if (!pp) return true;
          return breakerClosedRef.current && failureSim.lit(cityWorld.position.x + pp.x, cityWorld.position.z + pp.z);
        };
        homeLife.update = (time) => {
          homeLife.plotPos.forEach((pp, idx) => {
            if (!pp) return;
            const on = homeLife.plotOn(idx);
            if (homeLife.on[idx] !== on) {
              homeLife.on[idx] = on;
              homeLife.lights.forEach(l => { if (l.plot === idx) l.mat.color.setHex(on ? l.on : l.off); });
            }
          });
          homeLife.tickers.forEach(t => { if (homeLife.on[t.plot] !== false) t.fn(time); });
          homeLife.hooks.forEach(hk => { if (homeLife.on[hk.plot] === false) hk.fn(time); });
          homeLife.actors.forEach((ac, i) => {
            if (homeLife.on[ac.plot] !== false) return;
            ac.s.headY = Math.sin(time * 0.9 + i) * 0.6;
            ac.s.headX = -0.05 + Math.sin(time * 0.5 + i * 2) * 0.12;
            ac.s.smile = 0;
            ac.s.talk = 0;
            ac.person.apply(ac.s);
          });
        };
