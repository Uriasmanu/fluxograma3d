          // ---------- Casa com interior ----------
          const buildHome = (plotGroup, plot, idx, lamps) => {
            homeLife.curPlot = idx;
            homeLife.plotPos[idx] = { x: plot.x, z: plot.z };
            const stories = plot.stories;
            const t = 0.12;
            const Y0 = 0.35;
            const heights = stories === 2 ? [[Y0, 2.1], [2.3, 4.03]] : [[Y0, 2.43]];
            const top = stories === 2 ? 4.15 : 2.55;
            const base = addCtx(plotGroup, idx, 'casa', Y0);
            const glassPanes = [];
            const addGlass = (axis, fixed, a0, a1, b0, b1) => {
              const w = a1 - a0;
              const h = b1 - b0;
              const mesh = new THREE.Mesh(axis === 'x' ? box(w, h, 0.02) : box(0.02, h, w), glassMat);
              mesh.position.set(axis === 'x' ? (a0 + a1) / 2 : fixed, (b0 + b1) / 2, axis === 'x' ? fixed : (a0 + a1) / 2);
              plotGroup.add(mesh);
              base.obs('vidro', mesh.position.x, mesh.position.y, mesh.position.z, axis === 'x' ? w : 0.04, h, axis === 'x' ? 0.04 : w);
            };
            const addWall = (axis, fixed, a0, a1, y0, y1, openings, name) => {
              const pts = [a0, a1];
              openings.forEach(op => pts.push(op[0], op[1]));
              const sorted = [...new Set(pts)].sort((p, q) => p - q);
              for (let i = 0; i < sorted.length - 1; i++) {
                const p = sorted[i];
                const q = sorted[i + 1];
                if (q - p < 1e-4) continue;
                const cover = openings.find(op => op[0] <= p + 1e-6 && q <= op[1] + 1e-6);
                const put = (b0, b1) => {
                  if (b1 - b0 < 1e-4) return;
                  const ac = (p + q) / 2;
                  const yc = (b0 + b1) / 2;
                  if (axis === 'x') base.blk(name, q - p, b1 - b0, t, ac, yc, fixed, wallMat);
                  else base.blk(name, t, b1 - b0, q - p, fixed, yc, ac, wallMat);
                };
                if (!cover) put(y0, y1);
                else {
                  put(y0, cover[2]);
                  put(cover[3], y1);
                }
              }
            };

            heights.forEach(([Fb, Ft], fi) => {
              const frontOps = [[-1.6, -0.45, Fb + 0.4, Fb + 1.35], [0.45, 1.6, Fb + 0.4, Fb + 1.35]];
              if (fi === 0) frontOps.push([-0.28, 0.28, Fb, Fb + 1.35]);
              addWall('x', 1.54, -1.8, 1.8, Fb, Ft, frontOps, 'parede-frente');
              addWall('x', -1.54, -1.8, 1.8, Fb, Ft, [], 'parede-fundo');
              [-1.74, 1.74].forEach(x => addWall('z', x, -1.6, 1.6, Fb, Ft, [[-0.6, 0.6, Fb + 0.4, Fb + 1.35]], 'parede-lado'));
              addGlass('x', 1.54, -1.6, -0.45, Fb + 0.4, Fb + 1.35);
              addGlass('x', 1.54, 0.45, 1.6, Fb + 0.4, Fb + 1.35);
              [-1.74, 1.74].forEach(x => addGlass('z', x, -0.6, 0.6, Fb + 0.4, Fb + 1.35));
              if (fi === 0) {
                addMesh(plotGroup, box(0.5, 1.3, 0.04), woodMat, 0, Fb + 0.65, 1.55, true);
                addMesh(plotGroup, new THREE.SphereGeometry(0.025, 6, 6), metalMat, 0.18, Fb + 0.65, 1.58, false);
                base.obs('porta', 0, Fb + 0.65, 1.55, 0.56, 1.3, 0.05);
              }
              addMesh(plotGroup, box(3.36, 0.006, 2.96), stdMat(fi === 0 ? '#b79468' : '#9c7a52', 0.7), 0, Fb + 0.003, 0, false);
              const accent = addMesh(plotGroup, new THREE.PlaneGeometry(3.36, Ft - Fb), stdMat(['#e8dcc0', '#cfe0d4', '#e3d0d0', '#d0d8e8'][(idx + fi) % 4], 0.9), 0, (Fb + Ft) / 2, -1.475, false);
              addLamp(base, 0, Ft - 0.03, 0, lamps);
            });
            base.blk('piso-1-teto', 3.6, stories === 2 ? 0.2 : 0.12, 3.2, 0, stories === 2 ? 2.2 : 2.49, 0, wallMat);
            if (stories === 2) base.blk('laje-teto', 3.6, 0.12, 3.2, 0, 4.09, 0, wallMat);
            base.blk('piso-chao', 3.6, 0.1, 3.2, 0, Y0 - 0.05, 0, wallMat, false);

            const meterBox = addMesh(plotGroup, box(0.15, 0.22, 0.08), stdMat('#dfe3e6', 0.5), 1.7, Y0 + 0.95, 1.64);
            const meterGlass = addMesh(plotGroup, new THREE.CylinderGeometry(0.055, 0.055, 0.01, 14), glassMat, 1.7, Y0 + 0.97, 1.69, false);
            meterGlass.rotation.x = Math.PI / 2;
            const disc = addMesh(plotGroup, new THREE.CylinderGeometry(0.045, 0.045, 0.004, 14), metalMat, 1.7, Y0 + 0.97, 1.685, false);
            disc.rotation.x = Math.PI / 2;
            const mark = addMesh(disc, box(0.01, 0.006, 0.03), new THREE.MeshBasicMaterial({ color: 0xd9534f }), 0.02, 0, 0, false);
            const digits = addMesh(plotGroup, box(0.1, 0.03, 0.01), new THREE.MeshBasicMaterial({ color: 0x1b4d2c }), 1.7, Y0 + 0.86, 1.685, false);
            base.obs('medidor', 1.7, Y0 + 0.95, 1.65, 0.16, 0.22, 0.1);
            addTicker((time) => {
              disc.rotation.y = time * (1.5 + (idx % 3) * 0.6);
              digits.material.color.setHex(Math.floor(time * 2 + idx) % 2 ? 0x2fbf6a : 0x1b4d2c);
            });

            const rooms = plot.rooms;
            const outdoorCtx = addCtx(plotGroup, idx, 'fora', Y0);
            const seedBase = idx * 3.1;
            rooms.forEach((room, fi) => {
              const Fb = heights[fi][0];
              const rctx = addCtx(plotGroup, idx, 'dentro', Fb);
              indoor[room](rctx, { n: idx * 2 + fi, seed: seedBase + fi, phase: idx * 3.7 + fi * 5.3, game: room === 'game', screen: fi === 1 ? 'doc' : 'code' });
            });
            outdoor[plot.outside](outdoorCtx, { n: idx * 2 + 1, seed: seedBase + 1, phase: idx * 2.9 });
          };

          indoor.game = indoor.tv;
          return { buildHome, indoor };
