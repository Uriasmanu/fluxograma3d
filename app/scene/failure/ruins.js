          // ---------- ruínas ----------
          const burnt = new THREE.MeshBasicMaterial({ color: '#141414', transparent: true, opacity: 0.88, depthWrite: false });
          const wreck = new THREE.Group();
          wreck.visible = false;
          root.add(wreck);
          const burnDisc = new THREE.Mesh(new THREE.CircleGeometry(4.8, 28), burnt);
          burnDisc.rotation.x = -Math.PI / 2;
          burnDisc.position.y = 0.37;
          wreck.add(burnDisc);
          const wreckMat = new THREE.MeshStandardMaterial({ color: '#232323', roughness: 0.9 });
          const addWreck = (w, h, d, x, y, z, rx, rz) => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wreckMat);
            m.position.set(x, y, z);
            m.rotation.set(rx || 0, 0, rz || 0);
            m.castShadow = true;
            wreck.add(m);
          };
          addWreck(3.2, 0.5, 2.4, 0, 0.6, 0, 0, 0);
          addWreck(1.4, 0.9, 0.12, -1.1, 1.1, 1.0, 0.3, 0.1);
          addWreck(0.12, 0.8, 1.6, 1.5, 0.9, -0.3, 0, -0.35);
          addWreck(1.0, 0.1, 1.1, 0.5, 1.1, -0.5, 0.2, 0.15);
          [-1.0, -0.4, 0.2, 0.8].forEach((x, i) => addWreck(0.12, 1.1 - i * 0.2, 1.4, x, 0.7, -2.0, 0.1 * i, 0.12 * (i - 1.5)));
          const wreckFires = [makeFire(wreck, 0, 0.9, 0, 2.2), makeFire(wreck, -1.1, 0.8, 0.5, 1.5), makeFire(wreck, 1.0, 0.8, -0.6, 1.7), makeFire(wreck, 0.2, 0.7, -2.0, 1.2), makeFire(wreck, 1.6, 0.6, 1.0, 1.0)];

          const buildingDefs = [
            { key: 'main', c: [-3.2, -3.2], size: [4.6, 4.6], h: 7 },
            { key: 'mid', c: [1.5, -3.2], size: [4.4, 4.4], h: 5 },
            { key: 'office', c: [-2.6, 1.8], size: [5.8, 4.2], h: 3 }
          ];
          const collapses = buildingDefs.map(def => {
            const wx = 16.4 - def.c[0];
            const wz = -def.c[1];
            const ruin = new THREE.Group();
            ruin.position.set(def.c[0], 0, def.c[1]);
            ruin.visible = false;
            plantWorld.add(ruin);
            const disc = new THREE.Mesh(new THREE.CircleGeometry(Math.max(def.size[0], def.size[1]) * 0.62, 20), burnt);
            disc.rotation.x = -Math.PI / 2;
            disc.position.y = 0.04;
            ruin.add(disc);
            for (let i = 0; i < 16; i++) {
              const m = new THREE.Mesh(new THREE.BoxGeometry(rnd(0.4, 1.4), rnd(0.15, 0.9), rnd(0.4, 1.4)), i % 3 === 0 ? wreckMat : concreteMat);
              m.position.set(rnd(-def.size[0] / 2, def.size[0] / 2) * 0.9, 0.3, rnd(-def.size[1] / 2, def.size[1] / 2) * 0.9);
              m.rotation.set(rnd(-0.4, 0.4), rnd(0, 3), rnd(-0.4, 0.4));
              m.castShadow = true;
              ruin.add(m);
            }
            const ruinFires = [makeFire(ruin, -def.size[0] * 0.2, 0.4, 0, 1.6), makeFire(ruin, def.size[0] * 0.25, 0.4, def.size[1] * 0.2, 1.2), makeFire(ruin, 0, 0.4, -def.size[1] * 0.25, 1.4)];
            return { def, wx, wz, dist: Math.hypot(wx, wz), ruin, ruinFires, started: false, tc: 0 };
          });

          const attached = [moduleNodes.tm.group, moduleNodes.bm.group, moduleNodes.gmp.group, gmpPipe, labelSprites.tm, labelSprites.bm, labelSprites.gmp].filter(Boolean);
          const flash = document.createElement('div');
          flash.style.cssText = 'position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:50;';
          document.body.appendChild(flash);
          const vignette = document.createElement('div');
          vignette.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:40;opacity:0;box-shadow:inset 0 0 180px 40px rgba(220,20,20,0.75);';
          document.body.appendChild(vignette);
