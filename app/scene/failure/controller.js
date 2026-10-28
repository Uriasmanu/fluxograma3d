          return {
            shake,
            start: () => {
              if (st.phase !== 'idle') return;
              st.phase = 'countdown';
              st.t = 0;
              st.breakerDone = false;
              st.lastRem = -1;
              st.lastAlert = -1;
              failureSim.active = true;
              failureSim.exploded = false;
              failureSim.elapsed = 0;
              failureSim.mode = 'normal';
              failureSim.remaining = FAIL_SECONDS;
              st.beaconsOn = false;
              try {
                const mq = failureSim.mqTexture;
                if (mq) st.mqSnap = mq.image.getContext('2d').getImageData(0, 0, 512, 320);
              } catch (e) {
                st.mqSnap = null;
              }
              setAlarms(prev => [{ id: Date.now(), msg: 'FALHA CRÍTICA: Trafo 01 em sobretemperatura. Explosão iminente!', time: new Date().toLocaleTimeString() }, ...prev]);
              ui(true);
            },
            abort: () => {
              if (st.phase !== 'countdown') return;
              st.phase = 'aborting';
              st.ta = 0;
              st.heat = matTrafo.emissiveIntensity;
              failureSim.active = false;
              failureSim.elapsed = 0;
              beacons.forEach(b => { b.g.visible = false; });
              arcs.forEach(a => { a.line.visible = false; });
              alarmLight.intensity = 0;
              vignette.style.opacity = '0';
              evac.forEach(e => { e.obj.visible = true; });
              try {
                const mq = failureSim.mqTexture;
                if (mq && st.mqSnap) {
                  mq.image.getContext('2d').putImageData(st.mqSnap, 0, 0);
                  mq.needsUpdate = true;
                }
              } catch (e) {
                // sem restauração da tela
              }
              setAlarms(prev => [{ id: Date.now(), msg: 'SISTEMA: Falha desativada. Trafo 01 estabilizado.', time: new Date().toLocaleTimeString() }, ...prev]);
              ui(true);
            },
            restore: () => {
              if (st.phase !== 'exploded') return;
              st.phase = 'restoring';
              st.tr = 0;
              st.screensBack = false;
              st.knockReleased = false;
              failureSim.mode = 'restore';
              failureSim.waveR = 0;
              beacons.forEach(b => { b.g.visible = false; });
              alarmLight.intensity = 0;
              setBreakerClosed(true);
              setAlarms(prev => [{ id: Date.now(), msg: 'SISTEMA: Restauração da subestação iniciada.', time: new Date().toLocaleTimeString() }, ...prev]);
              ui(true);
            },
            update: (time) => {
              const dt = Math.min(0.1, Math.max(0, time - st.last));
              st.last = time;
              stepPool(smokePool, dt, 0.35);
              stepPool(dustPool, dt, 0.05);
              stepPool(sparkPool, dt, -14);
              stepDebris(dt);
              updateFires(time);
              beacons.forEach(b => {
                if (!b.g.visible) return;
                b.spin.rotation.y = time * 5;
                b.lamp.material.color.set(Math.floor(time * 4) % 2 ? '#ff2a2a' : '#ff9a9a');
              });
              shake.set(0, 0, 0);
              if (st.phase === 'idle') {
                rerouteVans(time, false);
                return;
              }

              if (st.phase === 'aborting') {
                st.ta += dt;
                const k = 1 - ss(0, 3, st.ta);
                matTrafo.emissiveIntensity = st.heat * k;
                matRadiator.emissiveIntensity = st.heat * 0.8 * k;
                trafoGroup.position.x *= 0.9;
                trafoGroup.scale.lerp(V3(1, 1, 1), 0.1);
                st.shake = 0;
                st.smoke += dt * 14 * k;
                while (st.smoke >= 1) {
                  st.smoke -= 1;
                  emit(smokePool, rnd(-1.2, 1.2), rnd(2.6, 3.8), rnd(-0.8, 0.6), rnd(0.2, 1.0), rnd(1.2, 2.2), rnd(-0.3, 0.3), rnd(2.5, 3.5), rnd(0.3, 0.5), rnd(1.2, 2), 0.35);
                }
                if (st.ta >= 3) {
                  st.phase = 'idle';
                  st.t = 0;
                  matTrafo.emissive.setHex(0x000000);
                  matTrafo.emissiveIntensity = 0;
                  matRadiator.emissive.setHex(0x000000);
                  matRadiator.emissiveIntensity = 0;
                  trafoGroup.position.x = 0;
                  trafoGroup.scale.set(1, 1, 1);
                  ui(true);
                } else ui(false);
              } else if (st.phase === 'countdown') {
                st.t += dt;
                failureSim.elapsed = st.t * (60 / FAIL_SECONDS);
                failureSim.remaining = FAIL_SECONDS - st.t;
                const p = Math.min(1, Math.max(0, st.t - INTRO) / (FAIL_SECONDS - INTRO));
                if (st.t >= INTRO && !st.beaconsOn) {
                  st.beaconsOn = true;
                  beacons.forEach(b => { b.g.visible = true; });
                  treetechRoof.open = false;
                }
                if (st.t >= INTRO && st.t < INTRO + 3.5) {
                  const k = 1 - Math.exp(-dt * 1.8);
                  controls.object.position.lerp(ISO_POS, k);
                  controls.target.lerp(ISO_TARGET, k);
                }
                const pulse = 0.5 + 0.5 * Math.sin(time * (4 + 10 * p));
                matTrafo.emissive.setHex(0xff2a10);
                matTrafo.emissiveIntensity = (0.05 + 0.85 * p) * (0.6 + 0.4 * pulse);
                matRadiator.emissive.setHex(0xff2a10);
                matRadiator.emissiveIntensity = (0.04 + 0.7 * p) * (0.6 + 0.4 * pulse);
                alarmLight.intensity = 3.2 * (0.5 + 0.5 * Math.sin(time * 6)) * ss(INTRO, INTRO + 1.5, st.t);
                vignette.style.opacity = String(0.35 + 0.35 * Math.sin(time * 5));
                trafoGroup.position.x = Math.sin(time * 55) * 0.006 * (1 + 5 * p) * ss(0, 0.4, p);
                const s = 1 + 0.012 * p * Math.sin(time * 18);
                trafoGroup.scale.set(s, 1 + 0.015 * p * Math.sin(time * 22), s);

                st.smoke += dt * (st.t > INTRO ? 2 + 34 * Math.pow(p, 1.1) : 0);
                while (st.smoke >= 1) {
                  st.smoke -= 1;
                  emit(smokePool, rnd(-1.2, 1.2), rnd(2.6, 3.8), rnd(-0.8, 0.6), rnd(0.2, 1.0), rnd(1.4, 2.6) + p * 2, rnd(-0.3, 0.3), rnd(3, 4.5), rnd(0.3, 0.5), rnd(1.4, 2.4), 0.55);
                }
                st.spark += dt * (p > 0.1 ? 2 + 14 * p : 0);
                while (st.spark >= 1) {
                  st.spark -= 1;
                  const bx = [-0.8, 0, 0.8][Math.floor(Math.random() * 3)];
                  emit(sparkPool, bx, 3.9, 0.4, rnd(-3, 3), rnd(2, 6), rnd(-3, 3), rnd(0.5, 1.1), 1, 0, 1);
                }
                if (st.t >= INTRO) updateArcs(p);
                if (p > 0.6) st.shake = Math.max(st.shake, (p - 0.6) / 0.4 * 0.12);
                evac.forEach(e => { if (st.t > e.at) e.obj.visible = false; });
                if (st.mqNext <= time && failureSim.mqTexture) {
                  st.mqNext = time + 0.2;
                  failureSim.paintAlert(failureSim.mqTexture.image.getContext('2d'), 512, 320, time);
                  failureSim.mqTexture.needsUpdate = true;
                }
                ui(false);
                if (st.t >= FAIL_SECONDS) explode(time);
              } else if (st.phase === 'exploded') {
                st.te += dt;
                const te = st.te;
                blastLight.intensity = 38 * Math.exp(-te * 2.2);
                alarmLight.intensity = 0;
                vignette.style.opacity = '0';
                trafoGroup.scale.set(1, 1, 1);
                trafoGroup.position.x = 0;
                fireballs.forEach(f => {
                  const q = Math.max(0, te - f.delay);
                  f.mesh.visible = q > 0 && q < 3;
                  const r = f.r * (1 - Math.exp(-q * 3.4)) + 0.2;
                  f.mesh.scale.set(r, r * 0.85, r);
                  f.mesh.position.y = 2.2 + r * 0.35;
                  f.mesh.material.opacity = Math.max(0, 0.95 * (1 - ss(0.5, 2.6, q)));
                });
                ring.visible = te < 3.2;
                const rr = 1 + 32 * te;
                ring.scale.set(rr, rr, rr);
                ring.material.opacity = 0.7 * (1 - te / 3.2);
                dome.visible = te < 1.6;
                dome.scale.setScalar(1 + 26 * te);
                dome.material.opacity = 0.35 * (1 - te / 1.6);

                collapses.forEach(c => {
                  if (!c.started && rr >= c.dist) startCollapse(c);
                  if (c.started && !c.ruin.visible) {
                    c.tc += dt;
                    const g = plantParts[c.def.key];
                    const e = ss(0, 1.2, c.tc);
                    if (g) {
                      g.scale.y = Math.max(0.05, 1 - 0.95 * e * e);
                      g.position.x = Math.sin(time * 70) * 0.05 * (1 - e);
                    }
                    if (Math.random() < 0.6) emit(dustPool, c.wx + rnd(-2, 2), 0.5, c.wz + rnd(-2, 2), rnd(-1, 1), rnd(0.8, 2.5), rnd(-1, 1), rnd(2, 3.5), 1.2, 3, 0.55);
                    if (c.tc >= 1.2) {
                      if (g) g.visible = false;
                      c.ruin.visible = true;
                      c.ruin.scale.set(1, 1, 1);
                      c.ruinFires.forEach(f => {
                        f.group.visible = true;
                        f.amount = 1;
                      });
                    }
                  }
                });

                // apagão que se espalha a partir da subestação
                if (te >= 0.9) {
                  failureSim.mode = 'dark';
                  failureSim.waveR = (te - 0.9) * 9;
                }
                if (failureSim.waveR >= 95 && !st.breakerDone) {
                  st.breakerDone = true;
                  setBreakerClosed(false);
                  setAlarms(prev => [{ id: Date.now(), msg: 'FALHA: Trafo 01 destruído. Cidade sem energia.', time: new Date().toLocaleTimeString() }, ...prev]);
                }
                rerouteVans(time, true);

                // câmera sobe para uma vista aérea da cidade apagando
                if (te >= 1.2) {
                  if (!st.cam) st.cam = { t: 0, pos: controls.object.position.clone(), tgt: controls.target.clone() };
                  st.cam.t = Math.min(1, st.cam.t + dt / 3.8);
                  const e = ss(0, 1, st.cam.t);
                  controls.object.position.lerpVectors(st.cam.pos, AERIAL_POS, e);
                  controls.target.lerpVectors(st.cam.tgt, AERIAL_TARGET, e);
                }

                st.shake = Math.max(0, st.shake - dt * 0.4);
                st.smoke += dt * 22;
                while (st.smoke >= 1) {
                  st.smoke -= 1;
                  emit(smokePool, rnd(-1.8, 1.8), rnd(1.2, 2.4), rnd(-1.8, 1.8), rnd(0.4, 1.4), rnd(2.2, 4.2), rnd(-0.4, 0.4), rnd(5, 8), rnd(0.8, 1.2), rnd(2.6, 4), 0.7);
                }
                st.dust += dt * 7;
                while (st.dust >= 1) {
                  st.dust -= 1;
                  const c = collapses[Math.floor(Math.random() * collapses.length)];
                  if (c.ruin.visible) emit(smokePool, c.wx + rnd(-1.5, 1.5), 1, c.wz + rnd(-1.5, 1.5), rnd(0.2, 1.2), rnd(1.4, 2.8), rnd(-0.3, 0.3), rnd(4, 6.5), 0.7, 2.4, 0.5);
                }
                if (Math.random() < 0.15) emit(sparkPool, rnd(-1.5, 1.5), 1.2, rnd(-1.5, 1.5), rnd(-2, 2), rnd(3, 7), rnd(-2, 2), rnd(0.6, 1.2), 1, 0, 1);
                if (failureSim.mqTexture && st.mqNext <= time) {
                  st.mqNext = time + 0.2;
                  failureSim.paintAlert(failureSim.mqTexture.image.getContext('2d'), 512, 320, time);
                  failureSim.mqTexture.needsUpdate = true;
                }

                stepVictims(dt, rr);
              } else {
                // restauração gradual
                st.tr += dt;
                const tr = st.tr;
                alarmLight.intensity = 0;
                blastLight.intensity = 0;
                ring.visible = false;
                dome.visible = false;
                rerouteVans(time, false);

                // câmera acompanha o que está sendo reconstruído
                const shot = RESTORE_SHOTS.find(sh => tr < sh.until);
                const camK = 1 - Math.exp(-dt * 2.4);
                controls.object.position.lerp(shot.pos, camK);
                controls.target.lerp(shot.tgt, camK);

                // 1. fogo e fumaça diminuem, destroços somem
                const calm = 1 - ss(0, 3, tr);
                fires.forEach(f => { f.amount = calm; if (calm <= 0.01) f.group.visible = false; });
                st.smoke += dt * 22 * calm;
                while (st.smoke >= 1) {
                  st.smoke -= 1;
                  emit(smokePool, rnd(-1.8, 1.8), rnd(1.2, 2.4), rnd(-1.8, 1.8), rnd(0.4, 1.4), rnd(2.2, 4.2), rnd(-0.4, 0.4), rnd(4, 6), rnd(0.8, 1.2), rnd(2.6, 4), 0.6);
                }
                const shrink = 1 - ss(0.4, 3.2, tr);
                debris.forEach(p => {
                  if (!p.mesh.visible) return;
                  p.mesh.scale.setScalar(Math.max(0.001, shrink));
                  if (shrink <= 0.01) {
                    p.mesh.visible = false;
                    p.rest = true;
                  }
                });

                // 2. prédios se reerguem
                collapses.forEach((c, i) => {
                  const tb = tr - 6.5 - i * 0.5;
                  if (tb <= 0) return;
                  const g = plantParts[c.def.key];
                  const e = ss(0, 3.6, tb);
                  if (g) {
                    g.visible = true;
                    g.position.x = 0;
                    g.scale.y = 0.04 + 0.96 * e;
                  }
                  c.ruin.scale.y = Math.max(0.001, 1 - ss(0, 1.8, tb));
                  if (c.ruin.scale.y <= 0.01) c.ruin.visible = false;
                  if (tb < 3.6 && Math.random() < 0.5) emit(dustPool, c.wx + rnd(-2, 2), 0.4, c.wz + rnd(-2, 2), rnd(-0.6, 0.6), rnd(0.5, 1.5), rnd(-0.6, 0.6), rnd(2, 3), 1.0, 2.2, 0.35);
                });

                // 3. transformador reconstruído
                const tt = tr - 3.0;
                if (tt > 0) {
                  wreck.scale.y = Math.max(0.001, 1 - ss(0, 2.2, tt));
                  if (wreck.scale.y <= 0.01) wreck.visible = false;
                  trafoGroup.visible = true;
                  trafoGroup.position.x = 0;
                  trafoGroup.scale.set(1, 0.03 + 0.97 * ss(0, 3.2, tt), 1);
                  matTrafo.emissive.setHex(0x000000);
                  matTrafo.emissiveIntensity = 0;
                  matRadiator.emissive.setHex(0x000000);
                  matRadiator.emissiveIntensity = 0;
                  if (tt < 3.2 && Math.random() < 0.5) emit(sparkPool, rnd(-1.5, 1.5), 0.6 + 3 * ss(0, 3.2, tt), rnd(-1, 1), rnd(-2, 2), rnd(1, 4), rnd(-2, 2), rnd(0.3, 0.7), 1, 0, 1);
                  if (tt > 3.2) {
                    setShown(attached, true);
                    if (installer.props) installer.props.visible = true;
                  }
                }

                // 4. a energia volta em uma onda a partir da subestação
                if (tr >= 11) {
                  failureSim.waveR = (tr - 11) * 11;
                  if (tr > 11.5) particleSystemsRef.current.forEach(p => { p.visible = true; });
                }

                // 5. telas e alarmes voltam ao normal
                if (tr > 7 && !st.screensBack) {
                  st.screensBack = true;
                  failureSim.active = false;
                  failureSim.exploded = false;
                  try {
                    const mq = failureSim.mqTexture;
                    if (mq && st.mqSnap) {
                      mq.image.getContext('2d').putImageData(st.mqSnap, 0, 0);
                      mq.needsUpdate = true;
                    }
                  } catch (e) {
                    // sem restauração da tela
                  }
                }
                vignette.style.opacity = '0';

                // 6. técnico e vigias se levantam e voltam ao trabalho; funcionários voltam
                restoreVictims(tr);
                if (tr > 15.8 && !st.knockReleased) {
                  st.knockReleased = true;
                  releaseVictims();
                }
                evac.forEach(e => { if (tr > e.back) e.obj.visible = true; });

                if (tr >= RESTORE_SECONDS) {
                  st.phase = 'idle';
                  st.t = 0;
                  failureSim.mode = 'normal';
                  failureSim.waveR = 0;
                  failureSim.active = false;
                  failureSim.exploded = false;
                  failureSim.elapsed = 0;
                  trafoGroup.scale.set(1, 1, 1);
                  wreck.visible = false;
                  fires.forEach(f => { f.group.visible = false; });
                  collapses.forEach(c => {
                    c.started = false;
                    c.ruin.visible = false;
                    const g = plantParts[c.def.key];
                    if (g) {
                      g.visible = true;
                      g.scale.set(1, 1, 1);
                      g.position.set(0, 0, 0);
                    }
                  });
                  evac.forEach(e => { e.obj.visible = true; });
                  particleSystemsRef.current.forEach(p => { p.visible = true; });
                  ui(true);
                } else ui(false);
              }
              shake.set(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).multiplyScalar(st.shake);
            },
            late: (time) => {
              if (st.phase === 'idle' || !failureSim.active) return;
              const blink = Math.floor(time * 4) % 2 === 0;
              ['tm', 'bm', 'gmp', 'dm1', 'dm2'].forEach(key => {
                const node = moduleNodes[key];
                if (node && node.led) node.led.material.color.set(st.phase === 'countdown' ? (blink ? '#ff2a2a' : '#5a0000') : '#1a1a1a');
              });
              if (treetechLed.mesh) treetechLed.mesh.material.color.set(st.phase === 'countdown' ? (blink ? '#ff2a2a' : '#5a0000') : '#1a1a1a');
            }
          };
