          // ---------- Estação de café ----------
          const woodMat = stdMat('#dfe3e6', 0.6);
          const counterTopMat = stdMat('#5a4a3a', 0.6);
          const machineMat = stdMat('#2d3339', 0.4);
          const silverMat = stdMat('#aab4bc', 0.3);
          const glassTankMat = new THREE.MeshStandardMaterial({ color: '#7fb4d6', roughness: 0.2, transparent: true, opacity: 0.45 });
          const beanMat = new THREE.MeshStandardMaterial({ color: '#7a4a2a', roughness: 0.5, transparent: true, opacity: 0.85 });
          const COFFEE_CYCLE = 40;

          const buildCoffee = (cfg) => {
            const group = new THREE.Group();
            group.position.set(cfg.x, 0, cfg.z);
            group.rotation.y = cfg.rotY;
            furniture.add(group);
            const sin = Math.sin(cfg.rotY);
            const cos = Math.cos(cfg.rotY);
            const stBox = (name, cx, cy, cz, sx, sy, sz) => {
              const swap = Math.abs(sin) > 0.5;
              aabb(name, cfg.x + cx * cos + cz * sin, cy, cfg.z - cx * sin + cz * cos, swap ? sz : sx, sy, swap ? sx : sz);
            };
            const toStation = (xw, zw) => [(xw - cfg.x) * cos - (zw - cfg.z) * sin, (xw - cfg.x) * sin + (zw - cfg.z) * cos];

            addMesh(group, box(1.3, 0.8, 0.5), woodMat, 0, 0.4, 0);
            addMesh(group, box(1.32, 0.06, 0.52), counterTopMat, 0, 0.83, 0);
            stBox('balcao', 0, 0.43, 0, 1.32, 0.86, 0.52);

            const mach = new THREE.Group();
            mach.position.set(0, 0.86, -0.06);
            group.add(mach);
            addMesh(mach, box(0.46, 0.62, 0.24), machineMat, 0, 0.34, -0.08);
            addMesh(mach, box(0.46, 0.17, 0.3), stdMat('#3a424a', 0.5), 0, 0.115, 0);
            addMesh(mach, box(0.34, 0.012, 0.22), silverMat, 0, 0.215, 0.09);
            for (let g = 0; g < 5; g++) addMesh(mach, box(0.3, 0.004, 0.012), darkMat, 0, 0.223, 0.02 + g * 0.04, false);
            addMesh(mach, box(0.46, 0.12, 0.36), machineMat, 0, 0.47, 0.05);
            addMesh(mach, box(0.4, 0.012, 0.3), stdMat(GREEN, 0.4), 0, 0.535, 0.05, false);
            const spoutX = [-0.12, 0.12];
            spoutX.forEach(x => addMesh(mach, new THREE.CylinderGeometry(0.012, 0.016, 0.06, 8), silverMat, x, 0.38, 0.15));
            addMesh(mach, new THREE.CylinderGeometry(0.09, 0.1, 0.14, 12), beanMat, 0, 0.72, -0.08);
            addMesh(mach, new THREE.CylinderGeometry(0.095, 0.095, 0.02, 12), darkMat, 0, 0.8, -0.08);
            addMesh(mach, box(0.1, 0.4, 0.2), glassTankMat, -0.29, 0.3, -0.08);
            addMesh(mach, new THREE.CylinderGeometry(0.008, 0.008, 0.22, 6), silverMat, 0.27, 0.37, 0.12);
            addMesh(mach, box(0.04, 0.04, 0.1), silverMat, 0.27, 0.26, 0.15);
            stBox('cafeteira-corpo', 0, 1.2, -0.14, 0.46, 0.62, 0.24);
            stBox('cafeteira-cabeca', 0, 1.33, -0.01, 0.46, 0.12, 0.36);
            stBox('cafeteira-base', 0, 0.96, -0.06, 0.46, 0.2, 0.3);
            stBox('cafeteira-graos', 0, 1.59, -0.14, 0.2, 0.16, 0.2);
            stBox('cafeteira-tanque', -0.29, 1.16, -0.14, 0.1, 0.4, 0.2);

            const buttonX = [-0.04, 0.04];
            const lightMats = spoutX.map(() => new THREE.MeshBasicMaterial({ color: '#3a4a3f' }));
            [-0.17, -0.04, 0.04, 0.17].forEach((x, i) => {
              const decor = i === 1 || i === 2;
              const btn = addMesh(mach, new THREE.CylinderGeometry(0.014, 0.014, 0.012, 10), decor ? lightMats[i === 1 ? 0 : 1] : silverMat, x, 0.47, 0.232, false);
              btn.rotation.x = Math.PI / 2;
            });
            const dispCanvas = canvasOf(128, 64);
            const dctx = dispCanvas.getContext('2d');
            const dispTex = new THREE.CanvasTexture(dispCanvas);
            const display = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.08), new THREE.MeshBasicMaterial({ map: dispTex }));
            display.position.set(0, 0.59, 0.0415);
            mach.add(display);
            let displayKey = '';
            const paintDisplay = (key, label, progress) => {
              if (key === displayKey) return;
              displayKey = key;
              dctx.fillStyle = '#10261c';
              dctx.fillRect(0, 0, 128, 64);
              dctx.fillStyle = '#8fe3b0';
              dctx.font = 'bold 20px Arial, sans-serif';
              dctx.textBaseline = 'middle';
              dctx.fillText(label, 8, 24);
              dctx.fillStyle = '#2b4a3a';
              dctx.fillRect(8, 44, 112, 8);
              dctx.fillStyle = '#8fe3b0';
              dctx.fillRect(8, 44, 112 * progress, 8);
              dispTex.needsUpdate = true;
            };
            paintDisplay('idle', 'Pronto', 0);

            const cupMat = stdMat('#f4f7f5', 0.5);
            [0, 1, 2].forEach(i => addMesh(group, new THREE.CylinderGeometry(0.036, 0.03, 0.085, 10), cupMat, -0.5, 0.9 + i * 0.03, 0.12));
            addMesh(group, new THREE.CylinderGeometry(0.05, 0.05, 0.12, 10), glassTankMat, 0.5, 0.92, 0.1);
            addMesh(group, box(0.1, 0.07, 0.1), stdMat('#e8c34a', 0.6), 0.36, 0.895, 0.15);
            stBox('copos', -0.5, 0.94, 0.12, 0.08, 0.16, 0.08);
            stBox('garrafa', 0.5, 0.92, 0.1, 0.1, 0.12, 0.1);
            stBox('acucar', 0.36, 0.895, 0.15, 0.1, 0.07, 0.1);

            const spoutTipY = 0.86 + 0.35;
            const spoutZ = -0.06 + 0.15;
            const cupY = 0.86 + 0.271;
            const streamMats = spoutX.map(() => new THREE.MeshBasicMaterial({ color: '#4b2e1e' }));
            const streams = spoutX.map((x, i) => {
              const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 1, 6), streamMats[i]);
              stream.visible = false;
              group.add(stream);
              return stream;
            });
            const dispensing = [-1, -1];

            // pontos em coordenadas da estação
            const buttonPos = buttonX.map(x => V(x, 0.86 + 0.47, -0.06 + 0.24));
            const cupPos = spoutX.map(x => V(x, cupY, spoutZ));

            const P = 0.58;
            const spots = cfg.spots.map((sp, idx) => {
              const person = createPerson(sp.person);
              group.add(person.root);
              officeLife.persons.push({ root: person.root, kind: 'cafe', station: cfg.name, idx });
              const m = sp.lat < 0 ? -1 : 1;
              const mugHand = m === -1 ? 0 : 1;
              const toP = (v) => V(-(v.x - sp.lat), v.y, -(v.z - P));
              const cupP = toP(cupPos[idx]);
              const btnP = toP(buttonPos[idx]).add(V(0, 0, -0.07));
              const S = cupP.clone().sub(V(0, 0, 0.06));
              const C = V(m * 0.13, 1.12, 0.34);
              const R = V(m * 0.28, 0.95, 0.08);
              const Roff = V(-m * 0.28, 0.95, 0.08);
              const keys = [[0, C], [0.7, S], [1.2, S], [2, btnP], [2.5, btnP], [3.2, R], [8, R], [8.8, S], [9.9, C]];
              const worldPts = sp.walk.map(([x, z]) => toStation(x, z));
              const path = makePath(worldPts, 'pingpong');
              const lookPt = toStation(sp.look[0], sp.look[1]);
              const lookYaw = Math.atan2(lookPt[0] - worldPts[worldPts.length - 1][0], lookPt[1] - worldPts[worldPts.length - 1][1]);
              const standPos = V(sp.lat, 0, P);
              const st = makeState();
              const tmp = V(0, 0, 0);
              const handMain = V(0, 0, 0);
              const handOff = V(0, 0, 0);
              const track = (u) => {
                if (u >= keys[keys.length - 1][0]) return handMain.copy(keys[keys.length - 1][1]);
                for (let i = 0; i < keys.length - 1; i++) {
                  if (u < keys[i + 1][0]) return handMain.lerpVectors(keys[i][1], keys[i + 1][1], ss(keys[i][0], keys[i + 1][0], u));
                }
                return handMain.copy(keys[0][1]);
              };
              const partnerNear = (time) => {
                const up = (time + cfg.spots[1 - idx].offset) % COFFEE_CYCLE;
                return 1 - ss(24.5, 25.5, up) * (1 - ss(35.5, 36.5, up));
              };
              const sipAmt = (u, a) => win(a, a + 0.6, a + 1.5, a + 2.1, u);

              officeLife.tickers.push((time) => {
                const u = (time + sp.offset) % COFFEE_CYCLE;
                st.time = time;
                st.mugHand = mugHand;
                st.chin = 0;
                st.talk = 0;
                st.smile = 0;
                st.mugPos = null;
                const walkLen = path.total;
                const seedT = time * 0.55 + sp.seed;
                const speak = ss(-0.2, 0.4, Math.sin(seedT));
                const presence = partnerNear(time);
                let sip = sipAmt(u, 11) + sipAmt(u, 16) + sipAmt(u, 21) + sipAmt(u, 29.6);
                let level = 0.12;
                if (u < 2.5) level = 0.12;
                else if (u < 8.2) level = 0.12 + 0.78 * ss(2.5, 8.2, u);
                else level = 0.9 - 0.26 * (ss(11.5, 12.1, u) + ss(16.5, 17.1, u) + ss(21.5, 22.1, u));
                if (u >= 25) level = 0.12;

                const walking = u >= 25 && u < 36;
                if (!walking) {
                  const chatAmt = presence * (ss(9, 10, u) * (1 - ss(24.5, 25.2, u)) + ss(35.5, 36.5, u));
                  const yaw = Math.PI + sp.yawSign * 0.6 * chatAmt;
                  person.root.position.copy(standPos);
                  person.root.rotation.y = yaw;
                  const mainHandPose = track(u >= 36 ? 40 : u);
                  handMain.copy(mainHandPose);
                  if (u > 2.5 && u < 3.2) handMain.z += 0;
                  if (u >= 2 && u <= 2.5) handMain.z += -0.015 * Math.sin(((u - 2) / 0.5) * Math.PI);
                  const gesture = chatAmt * speak;
                  tmp.set(-m * (0.22 + Math.sin(time * 2.1 + sp.seed) * 0.05), 1.12 + Math.sin(time * 3.3 + sp.seed) * 0.07, 0.36);
                  handOff.copy(Roff).lerp(tmp, gesture);
                  st.mugPos = (u >= 1 && u < 8.8) ? cupP : null;
                  st.hands[mugHand].copy(handMain);
                  st.hands[1 - mugHand].copy(handOff);
                  st.sip = Math.min(1, sip) * (u >= 9.9 ? 1 : 0);
                  st.level = level;
                  const lookAtMachine = 1 - ss(9, 10, u);
                  st.headX = 0.12 * lookAtMachine + (1 - lookAtMachine) * (Math.sin(time * 0.8 + sp.seed) * 0.04 - 0.02) + 0.04 * (1 - speak) * Math.sin(time * 3 + sp.seed) * chatAmt;
                  st.headY = sp.yawSign * 0.25 * chatAmt + Math.sin(time * 0.6 + sp.seed) * 0.05;
                  st.headZ = 0;
                  st.talk = chatAmt * speak * (0.5 + 0.5 * Math.sin(time * 13));
                  st.smile = 0.5 * chatAmt;
                  st.lean = 0.28 * Math.min(1, ss(0, 0.6, u) * (1 - ss(2.5, 3.2, u)) + ss(8, 8.8, u) * (1 - ss(9, 9.9, u))) + 0.04;
                  const press = u > 2 && u < 2.5 ? 1 : 0;
                  st.hip.set(Math.sin(time * 0.5 + sp.seed) * 0.02, 0.88 - 0.02 * press, 0.03 * Math.sin(time * 0.37));
                  st.feet[0].set(-0.11, 0, 0);
                  st.feet[1].set(0.11, 0, 0);
                  const dispAmt = u > 2.5 && u < 8.2 ? (u - 2.5) / 5.7 : -1;
                  dispensing[idx] = dispAmt;
                } else {
                  dispensing[idx] = -1;
                  const out = u < 28.5;
                  const back = u >= 32.5;
                  let dist;
                  let ampWalk;
                  if (out) {
                    const p = ss(0, 1, (u - 25) / 3.5);
                    dist = p * walkLen;
                    ampWalk = Math.min(1, Math.sin(Math.PI * p) * 2.5);
                  } else if (!back) {
                    dist = walkLen;
                    ampWalk = 0;
                  } else {
                    const p = ss(0, 1, (u - 32.5) / 3.5);
                    dist = walkLen + p * walkLen;
                    ampWalk = Math.min(1, Math.sin(Math.PI * p) * 2.5);
                  }
                  const smp = samplePath(path, dist);
                  const standYaw = Math.PI;
                  let yaw = smp.heading;
                  if (out) yaw = lerpAngle(lerpAngle(standYaw, smp.heading, ss(25, 25.7, u)), lookYaw, ss(27.8, 28.5, u));
                  else if (!back) yaw = lookYaw;
                  else yaw = lerpAngle(lerpAngle(lookYaw, smp.heading, ss(32.5, 33.2, u)), standYaw, ss(35.3, 36, u));
                  person.root.position.set(smp.x, 0, smp.z);
                  person.root.rotation.y = yaw;
                  const phase = dist * 4;
                  st.hip.set(0, 0.88 - 0.015 * Math.abs(Math.sin(phase)) * ampWalk, 0);
                  st.lean = 0.04;
                  [0, 1].forEach(i => {
                    const sg = i === 0 ? -1 : 1;
                    const ph = phase + (i === 0 ? 0 : Math.PI);
                    st.feet[i].set(sg * 0.11, 0.1 * Math.max(0, -Math.sin(ph)) * ampWalk, 0.25 * Math.cos(ph) * ampWalk);
                  });
                  st.hands[mugHand].copy(C);
                  const swing = Math.sin(phase + (mugHand === 0 ? Math.PI : 0)) * 0.45 * ampWalk;
                  st.hands[1 - mugHand].set(-m * 0.27, 1.36 - 0.55 * Math.cos(swing) + 0.02, 0.1 + 0.55 * Math.sin(swing));
                  st.sip = Math.min(1, sip);
                  st.level = level;
                  const dwell = !out && !back;
                  st.headX = dwell ? -0.05 + Math.sin(time * 0.7 + sp.seed) * 0.05 : 0;
                  st.headY = dwell ? Math.sin(time * 0.5 + sp.seed) * 0.15 : 0;
                  st.smile = dwell ? 0.3 : 0;
                }
                person.apply(st);
              });
              return { person, idx };
            });

            officeLife.tickers.push((time) => {
              [0, 1].forEach(i => {
                const d = dispensing[i];
                const stream = streams[i];
                if (d >= 0) {
                  const level = 0.12 + 0.78 * d;
                  const surface = cupY - 0.0435 + level * 0.087;
                  const top = spoutTipY - 0.035;
                  stream.visible = true;
                  stream.scale.y = top - surface;
                  stream.position.set(spoutX[i], (top + surface) / 2, spoutZ);
                  lightMats[i].color.set(Math.floor(time * 4) % 2 === 0 ? '#ffb347' : '#6a4a20');
                } else {
                  stream.visible = false;
                  lightMats[i].color.set('#3a4a3f');
                }
              });
              const busy = dispensing[0] >= 0 ? 0 : dispensing[1] >= 0 ? 1 : -1;
              if (busy >= 0) {
                const prog = dispensing[busy];
                paintDisplay('busy' + Math.round(prog * 20), 'Preparando', prog);
              } else paintDisplay('idle', 'Pronto', 1);
            });
            officeLife.coffee.push({ group, dispensing });
          };
