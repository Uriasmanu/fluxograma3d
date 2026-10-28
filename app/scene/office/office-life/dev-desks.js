          // ---------- Mesa de desenvolvedor ----------
          const deskMat = stdMat('#a8896a', 0.7);
          const chairMat = stdMat('#4a5360');
          const darkMat = stdMat('#3a4048', 0.5);
          const plasticMat = stdMat('#1f2429', 0.4);
          const keyCanvas = canvasOf(128, 44);
          const kctx = keyCanvas.getContext('2d');
          kctx.fillStyle = '#2b323a';
          kctx.fillRect(0, 0, 128, 44);
          kctx.fillStyle = '#4a5560';
          for (let r = 0; r < 4; r++) for (let c = 0; c < 14; c++) kctx.fillRect(3 + c * 8.9, 3 + r * 10, 7.4, 8);
          kctx.fillRect(30, 33, 60, 8);
          const keyboardMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(keyCanvas) });

          const addDevDesk = (dx, deskZ, cfg) => {
            const seatZ = deskZ + 0.78;
            if (!cfg.rabbit) {
              addMesh(furniture, box(1.6, 0.06, 0.8), deskMat, dx, 0.75, deskZ);
              addMesh(furniture, box(0.05, 0.72, 0.7), deskMat, dx - 0.75, 0.36, deskZ);
              addMesh(furniture, box(0.05, 0.72, 0.7), deskMat, dx + 0.75, 0.36, deskZ);
              aabb('mesa', dx, 0.75, deskZ, 1.6, 0.06, 0.8);
              aabb('mesa-lado', dx - 0.75, 0.36, deskZ, 0.05, 0.72, 0.7);
              aabb('mesa-lado', dx + 0.75, 0.36, deskZ, 0.05, 0.72, 0.7);

              addMesh(furniture, box(0.6, 0.4, 0.035), plasticMat, dx, 1.05, deskZ - 0.25);
              addMesh(furniture, box(0.06, 0.18, 0.05), plasticMat, dx, 0.88, deskZ - 0.27);
              addMesh(furniture, box(0.24, 0.015, 0.18), plasticMat, dx, 0.79, deskZ - 0.27);
              aabb('monitor', dx, 1.05, deskZ - 0.25, 0.6, 0.4, 0.035);
              aabb('monitor-pe', dx, 0.84, deskZ - 0.27, 0.24, 0.1, 0.18);
              const screen = makeScreen(cfg.screen, cfg.seed || 0);
              const face = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.36), new THREE.MeshBasicMaterial({ map: screen.texture }));
              face.position.set(dx, 1.05, deskZ - 0.2315);
              furniture.add(face);

              addMesh(furniture, box(0.2, 0.42, 0.4), darkMat, dx + 1.05, 0.21, deskZ);
              addMesh(furniture, box(0.012, 0.3, 0.012), stdMat('#6fdf8a', 0.3), dx + 0.95, 0.3, deskZ + 0.2, false);
              aabb('torre-pc', dx + 1.05, 0.21, deskZ, 0.2, 0.42, 0.4);

              addMesh(furniture, box(0.42, 0.02, 0.14), plasticMat, dx, 0.79, deskZ + 0.28);
              const keys = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.125), keyboardMat);
              keys.rotation.x = -Math.PI / 2;
              keys.position.set(dx, 0.801, deskZ + 0.28);
              furniture.add(keys);
              aabb('teclado', dx, 0.79, deskZ + 0.28, 0.42, 0.02, 0.14);
            }
            if (cfg.rabbit) {
              aabb('mesa', dx, 0.75, deskZ, 1.6, 0.06, 0.8);
              aabb('mesa-lado', dx - 0.75, 0.36, deskZ, 0.05, 0.72, 0.7);
              aabb('mesa-lado', dx + 0.75, 0.36, deskZ, 0.05, 0.72, 0.7);
              aabb('monitor', dx, 1.05, deskZ - 0.15, 0.7, 0.45, 0.04);
              aabb('teclado', dx, 0.79, deskZ + 0.28, 0.45, 0.02, 0.15);
              aabb('torre-rabbit', dx + 1.7, 0.5, deskZ, 0.5, 1.0, 0.7);
            }
            addMesh(furniture, box(0.06, 0.03, 0.1), plasticMat, dx + 0.32, 0.795, deskZ + 0.34);
            aabb('mouse', dx + 0.32, 0.795, deskZ + 0.34, 0.06, 0.03, 0.1);

            const chairParent = cfg.coffeeRun ? new THREE.Group() : furniture;
            if (cfg.coffeeRun) furniture.add(chairParent);
            const chairObs = (name, cx, cy, cz, sx, sy, sz) => {
              if (!cfg.coffeeRun) {
                aabb(name, cx, cy, cz, sx, sy, sz);
                return;
              }
              officeLife.obstacles.push({ name, dyn: () => ({ min: [cx - sx / 2, cy - sy / 2, cz - sz / 2 + chairParent.position.z], max: [cx + sx / 2, cy + sy / 2, cz + sz / 2 + chairParent.position.z] }) });
            };
            addMesh(chairParent, box(0.5, 0.06, 0.5), chairMat, dx, 0.45, seatZ);
            addMesh(chairParent, box(0.5, 0.55, 0.06), chairMat, dx, 0.75, seatZ + 0.25);
            addMesh(chairParent, new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), chairMat, dx, 0.22, seatZ);
            for (let i = 0; i < 5; i++) {
              const a = (i / 5) * Math.PI * 2;
              const leg = addMesh(chairParent, box(0.04, 0.03, 0.26), chairMat, dx + Math.sin(a) * 0.13, 0.04, seatZ + Math.cos(a) * 0.13);
              leg.rotation.y = a;
            }
            chairObs('cadeira-assento', dx, 0.45, seatZ, 0.5, 0.06, 0.5);
            chairObs('cadeira-encosto', dx, 0.75, seatZ + 0.25, 0.5, 0.55, 0.06);
            chairObs('cadeira-base', dx, 0.1, seatZ, 0.5, 0.2, 0.5);

            const extra = cfg.extra;
            if (extra === 'laptop') {
              addMesh(furniture, box(0.3, 0.015, 0.22), darkMat, dx - 0.55, 0.795, deskZ + 0.15);
              const lid = addMesh(furniture, box(0.3, 0.2, 0.01), darkMat, dx - 0.55, 0.9, deskZ + 0.03);
              lid.rotation.x = 0.25;
              const lscreen = makeScreen('chat', (cfg.seed || 0) + 0.4);
              const lface = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.17), new THREE.MeshBasicMaterial({ map: lscreen.texture }));
              lface.position.set(dx - 0.55, 0.9, deskZ + 0.0358);
              lface.rotation.x = 0.25;
              furniture.add(lface);
              aabb('laptop', dx - 0.55, 0.85, deskZ + 0.1, 0.32, 0.17, 0.3);
            } else if (extra === 'notebook') {
              addMesh(furniture, box(0.2, 0.012, 0.28), stdMat('#d9783a', 0.6), dx - 0.5, 0.786, deskZ + 0.15);
              addMesh(furniture, box(0.012, 0.012, 0.15), stdMat('#2b323a'), dx - 0.36, 0.796, deskZ + 0.18);
              aabb('caderno', dx - 0.5, 0.79, deskZ + 0.15, 0.2, 0.02, 0.28);
            }
            const pot = addMesh(furniture, new THREE.CylinderGeometry(0.05, 0.04, 0.08, 8), stdMat('#c0504a', 0.6), dx - 0.68, 0.82, deskZ - 0.25);
            [0, 1, 2].forEach(i => addMesh(pot, new THREE.SphereGeometry(0.045, 6, 5), stdMat('#4f8f5b', 0.7), Math.sin(i * 2.1) * 0.03, 0.08 + i * 0.015, Math.cos(i * 2.1) * 0.03));
            aabb('planta', dx - 0.68, 0.9, deskZ - 0.25, 0.12, 0.2, 0.12);

            const person = createPerson(cfg.person);
            person.root.position.set(dx, 0, seatZ);
            person.root.rotation.y = Math.PI;
            furniture.add(person.root);
            officeLife.persons.push({ root: person.root, kind: 'sentado' });

            const toLocal = (xw, y, zw) => V(-(xw - dx), y, -(zw - seatZ));
            const kbdR = toLocal(dx + 0.13, 0.88, deskZ + 0.28);
            const kbdL = toLocal(dx - 0.13, 0.88, deskZ + 0.28);
            const mouse = toLocal(dx + 0.32, 0.89, deskZ + 0.34);
            const mugRest = toLocal(dx + 0.48, 0.84, deskZ + 0.34);
            const mugHandRest = mugRest.clone().sub(V(0, 0, 0.06));
            const s = makeState();
            const cycleLen = 26;
            const hand0 = V(0, 0, 0);
            const hand1 = V(0, 0, 0);
            const tmp = V(0, 0, 0);

            const run = cfg.coffeeRun ? (() => {
              const corner = cfg.coffeeRun;
              const T = 25;
              const st = { clock: 0, last: null, p: null, lastEnd: 0 };
              const pts = [[dx, seatZ], [dx - 0.5, seatZ], [dx - 1.1, seatZ - 0.08], [corner.stand.x, corner.stand.z]];
              const path = makePath(pts, 'pingpong');
              const L = path.total;
              const root = person.root;
              const toLoc = (x, y, z, out) => {
                const ddx = x - root.position.x;
                const ddz = z - root.position.z;
                const c = Math.cos(root.rotation.y);
                const sn = Math.sin(root.rotation.y);
                return out.set(ddx * c - ddz * sn, y, ddx * sn + ddz * c);
              };
              const toWld = (v, out) => {
                const c = Math.cos(root.rotation.y);
                const sn = Math.sin(root.rotation.y);
                return out.set(root.position.x + v.x * c + v.z * sn, v.y, root.position.z - v.x * sn + v.z * c);
              };
              const C = V(-0.13, 1.12, 0.34);
              const Roff = V(0.28, 0.95, 0.08);
              const tA = V(0, 0, 0);
              const tB = V(0, 0, 0);
              const tW = V(0, 0, 0);
              const mugAtTable = V(0, 0, 0);
              const sipAmt = (p, a) => win(a, a + 0.6, a + 1.5, a + 2.1, p);
              return {
                get clock() { return st.clock; },
                advance: (time) => {
                  const dt = st.last === null ? 0 : Math.min(0.1, time - st.last);
                  st.last = time;
                  if (st.p === null) {
                    st.clock += dt;
                    const u26 = st.clock % cycleLen;
                    if (st.clock - st.lastEnd > 40 && u26 > 1 && u26 < 7) st.p = 0;
                  } else {
                    st.p += dt;
                    if (st.p >= T) {
                      st.p = null;
                      st.lastEnd = st.clock;
                      root.position.set(dx, 0, seatZ);
                      root.rotation.y = Math.PI;
                      chairParent.position.z = 0;
                      corner.carafePos.copy(corner.carafeRest);
                      corner.tilt = 0;
                      corner.level = 1;
                      corner.streamOn = false;
                    }
                  }
                },
                apply: (time) => {
                  const p = st.p;
                  if (p === null) return;
                  const w = ss(0, 1.2, p) * (1 - ss(23.2, 25, p));
                  let dist;
                  if (p < 1.4) dist = 0;
                  else if (p < 4.2) dist = ss(0, 1, (p - 1.4) / 2.8) * L;
                  else if (p < 19) dist = L;
                  else if (p < 22) dist = L + ss(0, 1, (p - 19) / 3) * L;
                  else dist = 2 * L - 0.0001;
                  const smp = samplePath(path, dist);
                  let yaw = Math.PI;
                  if (p >= 1.4 && p < 4.2) yaw = lerpAngle(lerpAngle(Math.PI, smp.heading, ss(1.4, 2.0, p)), Math.PI, ss(3.5, 4.2, p));
                  else if (p >= 19 && p < 22) yaw = lerpAngle(lerpAngle(Math.PI, smp.heading, ss(19, 19.6, p)), Math.PI, ss(21.3, 22, p));
                  root.position.set(p < 1.4 || p >= 22 ? dx : smp.x, 0, p < 1.4 || p >= 22 ? seatZ : smp.z);
                  root.rotation.y = yaw;
                  chairParent.position.z = 0.6 * ss(0, 0.8, p) * (1 - ss(22.2, 23.2, p));

                  const walking = (p >= 1.4 && p < 4.2) || (p >= 19 && p < 22);
                  const amp = walking ? Math.min(1, Math.sin(Math.PI * ss(0, 1, p < 10 ? (p - 1.4) / 2.8 : (p - 19) / 3)) * 2.5) : 0;
                  const ph = dist * 4;
                  const hipY = 0.88 - 0.015 * Math.abs(Math.sin(ph)) * amp;
                  const sit = ss(22.3, 24, p);
                  const stand = 1 - sit;

                  // alvo da rotina de levantar
                  const tgtHipY = sit > 0 ? 0.88 + (0.64 - 0.88) * sit : hipY;
                  const place = win(4.2, 4.9, 5.0, 5.2, p) + win(10.4, 11.2, 11.2, 11.4, p);
                  const tableHold = p >= 4.9 && p < 11.4;
                  toLoc(corner.mugTable.x, corner.mugTable.y + 0.0, corner.mugTable.z, mugAtTable);
                  const mugHandTable = V(mugAtTable.x, mugAtTable.y, mugAtTable.z - 0.06);
                  const pourT = ss(6.4, 7.4, p) * (1 - ss(9.6, 10.6, p));
                  const grabCar = ss(5.2, 6.2, p) * (1 - ss(11.0, 11.8, p));
                  const lean = p >= 4.2 && p < 11.8 ? 0.26 * ss(4.2, 5.0, p) * (1 - ss(11.0, 11.8, p)) + 0.03 : 0.03;

                  // carafa
                  tA.set(corner.carafeRest.x, corner.carafeRest.y, corner.carafeRest.z);
                  tB.set(corner.mugTable.x, corner.mugTable.y + 0.2, corner.mugTable.z - 0.07);
                  corner.carafePos.lerpVectors(tA, tB, pourT);
                  corner.tilt = 0.95 * pourT;
                  corner.level = 1 - 0.3 * ss(7.4, 9.4, p);
                  corner.streamOn = pourT > 0.85;
                  corner.streamFrom.set(corner.carafePos.x, corner.carafePos.y + 0.06, corner.carafePos.z + 0.07);
                  corner.streamTo.set(corner.mugTable.x, corner.mugTable.y + 0.02 + 0.07 * ss(7.4, 9.4, p), corner.mugTable.z);

                  // mao esquerda (indice 1) pega a carafa; direita (indice 0) cuida da caneca
                  toLoc(corner.carafePos.x, corner.carafePos.y, corner.carafePos.z - 0.07, tW);
                  const hand1 = V(0, 0, 0);
                  hand1.copy(Roff).lerp(V(tW.x, tW.y, tW.z), grabCar);
                  if (walking) {
                    const sw = Math.sin(ph) * 0.45 * amp;
                    hand1.set(0.27, 1.41 - 0.57 * Math.cos(sw), 0.02 + 0.57 * Math.sin(sw));
                  }
                  const hand0 = V(0, 0, 0);
                  const toRest = ss(0.2, 0.9, p) * (1 - ss(0.9, 1.6, p));
                  hand0.copy(mugHandRest).lerp(C, ss(0.9, 1.6, p));
                  hand0.lerp(mugHandTable, place);
                  if (sit > 0) {
                    hand0.copy(C).lerp(mugHandRest, ss(22.8, 23.8, p));
                  }
                  const sipW = (sipAmt(p, 12.3) + sipAmt(p, 16.5)) * (p > 11.6 && p < 19 ? 1 : 0);

                  const feet0 = V(-0.11, 0, 0);
                  const feet1 = V(0.11, 0, 0);
                  if (walking) {
                    [feet0, feet1].forEach((f, i) => {
                      const phi = ph + (i === 0 ? 0 : Math.PI);
                      f.set(i === 0 ? -0.11 : 0.11, 0.1 * Math.max(0, -Math.sin(phi)) * amp, 0.25 * Math.cos(phi) * amp);
                    });
                  }
                  const feetFwd = ss(22.0, 23.6, p) * 0.5;
                  const seatedFeet = ss(22.0, 23.6, p);
                  feet0.set(-0.11 - 0.01 * seatedFeet, 0, feet0.z + feetFwd);
                  feet1.set(0.11 + 0.01 * seatedFeet, feet1.y, feet1.z + feetFwd);

                  // mistura com a pose sentada
                  s.hip.set(0, s.hip.y + (tgtHipY - s.hip.y) * w, 0);
                  s.lean += (lean - s.lean) * w;
                  s.feet[0].lerp(feet0, w);
                  s.feet[1].lerp(feet1, w);
                  s.hands[0].lerp(hand0, w);
                  s.hands[1].lerp(hand1, w);
                  s.sip += (sipW - s.sip) * w;
                  s.chin *= 1 - w;
                  const drinking = p > 11.6 && p < 19;
                  s.headX += ((drinking ? 0.02 : (p > 4.2 && p < 11.6 ? 0.25 : 0.05)) - s.headX) * w;
                  s.headY += ((drinking ? Math.sin(time * 0.8) * 0.4 : 0) - s.headY) * w;
                  s.smile = Math.max(s.smile, drinking ? 0.6 * w : 0);
                  if (w > 0.5) {
                    if (tableHold) {
                      s.mugPos = V(mugAtTable.x, mugAtTable.y, mugAtTable.z);
                    } else if (p > 24) {
                      s.mugPos = mugRest;
                    } else if (p < 0.9) {
                      s.mugPos = mugRest;
                    } else {
                      s.mugPos = null;
                    }
                    if (p >= 7.4 && p < 24) s.level = 0.2 + 0.75 * ss(7.4, 9.4, p) - 0.3 * ss(12.3, 18.6, p);
                  }
                }
              };
            })() : null;

            officeLife.tickers.push((time) => {
              if (run) run.advance(time);
              const t = (run ? run.clock : time) + cfg.phase;
              const u = t % cycleLen;
              const n = Math.floor(t / cycleLen);
              const wMouse = win(8, 8.4, 10.6, 11, u);
              const wThink = win(11, 11.5, 13.2, 13.7, u);
              const wSip = win(13.5, 14, 18, 18.5, u);
              const wGlance = win(24, 24.5, 25.5, 26, u);
              const wType = Math.max(0, 1 - wMouse - wThink - wSip - wGlance);
              const lift = win(14.4, 15, 16.8, 17.4, u);
              const sipOn = u > 14.2 && u < 17.6;

              const jx = Math.sin(time * 13 + cfg.phase) * 0.03;
              const jy = Math.abs(Math.sin(time * 17 + cfg.phase)) * 0.012;
              const jz = Math.sin(time * 9 + 1) * 0.02;
              tmp.copy(kbdR).add(V(jx, jy, jz));
              hand0.set(0, 0, 0).addScaledVector(tmp, wType + wThink + wGlance);
              tmp.copy(mouse).add(V(Math.sin(time * 2) * 0.03, 0, Math.cos(time * 2.7) * 0.03));
              hand0.addScaledVector(tmp, wMouse);
              hand0.addScaledVector(mugHandRest, wSip);
              hand0.y += 0.28 * wSip * (1 - wSip);
              hand1.copy(kbdL).add(V(Math.sin(time * 11 + 2) * 0.03, Math.abs(Math.sin(time * 15)) * 0.012, Math.sin(time * 8) * 0.02));

              s.time = time;
              s.hip.set(0, 0.64 + Math.sin(time * 1.6) * 0.003, 0);
              s.lean = 0.12 * (wType + wMouse) + -0.06 * wThink + 0.02 * wSip + 0.05 * wGlance;
              s.headX = 0.22 * (wType + wMouse) - 0.12 * wThink + 0.05 * wSip - 0.05 * wGlance + Math.sin(time * 0.9 + cfg.phase) * 0.03;
              s.headY = cfg.glance * 0.8 * wGlance + Math.sin(time * 0.4 + cfg.phase) * 0.06 * wType;
              s.headZ = 0.12 * wThink * cfg.glance;
              s.smile = 0.7 * wGlance;
              s.talk = 0.5 * wGlance * (0.5 + 0.5 * Math.sin(time * 12));
              s.feet[0].set(-0.12, 0, 0.5);
              s.feet[1].set(0.12, 0, 0.5);
              s.hands[0].copy(hand0);
              s.hands[1].copy(hand1);
              s.chin = wThink;
              s.sip = lift;
              s.mugHand = 0;
              s.mugPos = sipOn ? null : mugRest;
              s.level = Math.max(0.1, 0.85 - 0.18 * (n % 4) - 0.18 * ss(15, 16.5, u));
              if (run) run.apply(time);
              person.apply(s);
            });
          };
