          const { GREEN, V, stdMat, box, addMesh, ss, win, lerpAngle, canvasOf, screenPainters, makeScreen, createPerson, makeState } = lifeKit;
          const SC = 0.62;
          const addTicker = (fn) => homeLife.tickers.push({ fn, plot: homeLife.curPlot });
          const makeHomeScreen = (kind, seed) => {
            const sc = makeScreen(kind, seed);
            sc.home = true;
            sc.plot = homeLife.curPlot;
            return sc;
          };
          const lightMat = (hex, offHex = 0x2a2f36) => {
            const mat = new THREE.MeshBasicMaterial({ color: hex });
            homeLife.lights.push({ mat, on: hex, off: offHex, plot: homeLife.curPlot });
            return mat;
          };

          screenPainters.tv = (ctx, time, seed) => {
            const scene = Math.floor(time / 4 + seed * 7) % 3;
            if (scene === 0) {
              ctx.fillStyle = '#1d3a6b';
              ctx.fillRect(0, 0, 320, 200);
              ctx.fillStyle = '#2f5aa0';
              ctx.fillRect(0, 150, 320, 50);
              ctx.fillStyle = '#e6c9a8';
              ctx.beginPath();
              ctx.arc(160, 80, 26, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#2b323a';
              ctx.fillRect(130, 108, 60, 60);
              ctx.fillStyle = '#d9534f';
              ctx.fillRect(0, 168, 320, 22);
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 14px Arial, sans-serif';
              ctx.textBaseline = 'middle';
              ctx.fillText('CONSUMO DE ENERGIA CRESCE 4% EM OUTUBRO', 320 - ((time * 60) % 640), 179);
            } else if (scene === 1) {
              ctx.fillStyle = '#7fc4e8';
              ctx.fillRect(0, 0, 320, 200);
              ctx.fillStyle = '#f6d86b';
              ctx.beginPath();
              ctx.arc(60 + (time * 8) % 200, 50, 22, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#4f9a5b';
              ctx.beginPath();
              ctx.moveTo(0, 200);
              ctx.quadraticCurveTo(100, 90, 200, 150);
              ctx.quadraticCurveTo(270, 120, 320, 160);
              ctx.lineTo(320, 200);
              ctx.fill();
            } else {
              ctx.fillStyle = '#2f8f4b';
              ctx.fillRect(0, 0, 320, 200);
              ctx.strokeStyle = '#e8f3ea';
              ctx.lineWidth = 2;
              ctx.strokeRect(14, 14, 292, 172);
              ctx.beginPath();
              ctx.moveTo(160, 14);
              ctx.lineTo(160, 186);
              ctx.stroke();
              ctx.beginPath();
              ctx.arc(160, 100, 28, 0, Math.PI * 2);
              ctx.stroke();
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(160 + Math.sin(time * 1.7) * 110, 100 + Math.cos(time * 2.3) * 60, 7, 0, Math.PI * 2);
              ctx.fill();
            }
          };
          screenPainters.game = (ctx, time, seed) => {
            ctx.fillStyle = '#1a1030';
            ctx.fillRect(0, 0, 320, 200);
            ctx.fillStyle = '#3a2a6a';
            ctx.fillRect(0, 0, 320, 80);
            ctx.fillStyle = '#2b2b3a';
            ctx.beginPath();
            ctx.moveTo(150, 80);
            ctx.lineTo(170, 80);
            ctx.lineTo(320, 200);
            ctx.lineTo(0, 200);
            ctx.fill();
            ctx.fillStyle = '#f0c75e';
            for (let i = 0; i < 6; i++) {
              const q = ((time * 1.4 + i / 6) % 1);
              const y = 80 + q * q * 120;
              ctx.fillRect(158 + (q * 2), y, 4 + q * 10, 3 + q * 8);
            }
            ctx.fillStyle = '#d9534f';
            ctx.fillRect(140 + Math.sin(time * 1.5) * 50, 168, 40, 18);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px monospace';
            ctx.textBaseline = 'middle';
            ctx.fillText('SCORE ' + String(Math.floor(time * 37)).padStart(6, '0'), 10, 14);
          };
          screenPainters.doc = (ctx, time, seed) => {
            ctx.fillStyle = '#f4f7f5';
            ctx.fillRect(0, 0, 320, 200);
            ctx.fillStyle = GREEN;
            ctx.fillRect(0, 0, 320, 18);
            ctx.fillStyle = '#9aa7b2';
            for (let i = 0; i < 9; i++) ctx.fillRect(14, 34 + i * 16, 180 + ((i * 53 + Math.floor(time)) % 90), 6);
            ctx.fillStyle = '#d9783a';
            ctx.fillRect(14, 34 + ((Math.floor(time * 2) % 9)) * 16 - 2, 6, 10);
          };

          const OUTFITS = [
            { skin: '#f1c7a1', shirt: '#d9783a', pants: '#2f3b52', hair: '#4a3426', hairStyle: 'short', top: 'tee', sleeves: 'short', shoe: '#e8ecef', mugColor: '#e8ecef' },
            { skin: '#9c6b4a', shirt: '#5b8fc0', pants: '#3a4048', hair: '#1f1a17', hairStyle: 'curly', top: 'hoodie', sleeves: 'long', shoe: '#2b323a', mugColor: '#c0504a' },
            { skin: '#e0ac86', shirt: '#6fbf8a', pants: '#566068', hair: '#7a4a2a', hairStyle: 'long', top: 'tee', sleeves: 'short', shoe: '#e8c34a', mugColor: '#2f9e5e' },
            { skin: '#f6d2b0', shirt: '#c0504a', pants: '#2f3b52', hair: '#c9a64a', hairStyle: 'bun', top: 'shirt', sleeves: 'long', glasses: true, shoe: '#e8ecef', mugColor: '#e8c34a' },
            { skin: '#b07850', shirt: '#9db8a4', pants: '#4a5360', hair: '#1f1a17', hairStyle: 'short', top: 'shirt', sleeves: 'short', beard: true, shoe: '#3a4048', mugColor: '#5b8fc0' },
            { skin: '#f1c7a1', shirt: '#e8c34a', pants: '#2f3b52', hair: '#8a5a3a', hairStyle: 'cap', top: 'tee', sleeves: 'short', shoe: '#e8ecef', mugColor: '#d9783a' },
            { skin: '#e0ac86', shirt: '#8a6fb0', pants: '#3a4048', hair: '#2b2118', hairStyle: 'long', top: 'hoodie', sleeves: 'long', glasses: true, shoe: '#e8ecef', mugColor: '#e8ecef' },
            { skin: '#9c6b4a', shirt: '#f4f7f5', pants: '#566068', hair: '#1f1a17', hairStyle: 'bald', top: 'tee', sleeves: 'short', beard: true, shoe: '#2b323a', mugColor: '#c0504a' }
          ];

          const wallMat = stdMat('#ffffff', 0.4);
          const woodMat = stdMat('#a8896a', 0.7);
          const darkMat = stdMat('#2b323a', 0.5);
          const metalMat = stdMat('#aab4bc', 0.3);
          const whiteMat = stdMat('#f4f7f5', 0.4);
          const fabricMats = ['#5b6f8a', '#8a5b5b', '#6a8a6a', '#7a6a8a'].map(c => stdMat(c, 0.9));
          const glassMat = new THREE.MeshStandardMaterial({ color: '#bcd7e6', roughness: 0.1, transparent: true, opacity: 0.18, depthWrite: false });
          const orangeMat = stdMat('#e07a1a', 0.6);
          const rugMat = stdMat('#c9b89a', 0.9);

          const makeCable = (parent, color, r = 0.012, n = 10) => {
            const mat = stdMat(color, 0.6);
            const segs = Array.from({ length: n }, () => {
              const seg = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 5), mat);
              parent.add(seg);
              return seg;
            });
            const pts = Array.from({ length: n + 1 }, () => V(0, 0, 0));
            const up = V(0, 1, 0);
            const dir = V(0, 0, 0);
            return {
              segs,
              update: (a, b, sag) => {
                for (let i = 0; i <= n; i++) {
                  const q = i / n;
                  pts[i].lerpVectors(a, b, q);
                  pts[i].y -= Math.sin(q * Math.PI) * sag;
                }
                segs.forEach((seg, i) => {
                  dir.subVectors(pts[i + 1], pts[i]);
                  const len = dir.length();
                  seg.position.addVectors(pts[i], pts[i + 1]).multiplyScalar(0.5);
                  seg.scale.set(1, Math.max(len, 0.0001), 1);
                  seg.quaternion.setFromUnitVectors(up, dir.normalize());
                });
              }
            };
          };

          const reachShoulder = V(0, 0, 0);
          const reachDelta = V(0, 0, 0);
          const reachSum = V(0, 0, 0);
          const assistReach = (s, sitting) => {
            for (let it = 0; it < 4; it++) {
              reachSum.set(0, 0, 0);
              [0, 1].forEach(i => {
                const sx = i === 0 ? -0.27 : 0.27;
                reachShoulder.set(s.hip.x + sx, s.hip.y + 0.53 * Math.cos(s.lean), s.hip.z + 0.53 * Math.sin(s.lean));
                reachDelta.subVectors(s.hands[i], reachShoulder);
                const len = reachDelta.length();
                if (len > 0.56) reachSum.addScaledVector(reachDelta.normalize(), len - 0.56);
              });
              if (reachSum.lengthSq() < 1e-6) break;
              if (sitting) {
                s.lean = Math.min(0.5, s.lean + reachSum.z * 0.9);
                s.hip.z = Math.max(-0.1, Math.min(0.12, s.hip.z + reachSum.z * 0.25));
              } else {
                s.hip.x = Math.max(-0.3, Math.min(0.3, s.hip.x + reachSum.x * 0.7));
                s.hip.z = Math.max(-0.3, Math.min(0.22, s.hip.z + reachSum.z * 0.7));
                s.hip.y = Math.max(0.55, Math.min(0.92, s.hip.y + reachSum.y * 0.7));
              }
            }
          };

          const makeActor = (ctx, outfitIdx, x, y, z, yaw) => {
            const person = createPerson(OUTFITS[outfitIdx % OUTFITS.length]);
            const root = person.root;
            root.scale.setScalar(SC);
            root.position.set(x, y, z);
            root.rotation.y = yaw;
            ctx.parent.add(root);
            homeLife.persons.push({ root, plot: ctx.idx, kind: ctx.kind });
            const s = makeState();
            s.mugVisible = false;
            homeLife.actors.push({ person, s, root, plot: homeLife.curPlot });
            return {
              person, root, s,
              toLocal: (px, py, pz, out) => {
                const dx = px - root.position.x;
                const dz = pz - root.position.z;
                const c = Math.cos(root.rotation.y);
                const sn = Math.sin(root.rotation.y);
                return out.set((dx * c - dz * sn) / SC, (py - root.position.y) / SC, (dx * sn + dz * c) / SC);
              },
              toWorld: (v, out) => {
                const c = Math.cos(root.rotation.y);
                const sn = Math.sin(root.rotation.y);
                return out.set(root.position.x + (v.x * c + v.z * sn) * SC, root.position.y + v.y * SC, root.position.z + (-v.x * sn + v.z * c) * SC);
              },
              apply: (time, sitting = false) => {
                s.time = time;
                assistReach(s, sitting);
                person.apply(s);
              }
            };
          };

          const standPose = (s, hipY = 0.88) => {
            s.hip.set(0, hipY, 0);
            s.lean = 0.03;
            s.headX = 0;
            s.headY = 0;
            s.headZ = 0;
            s.feet[0].set(-0.11, 0, 0);
            s.feet[1].set(0.11, 0, 0);
            s.hands[0].set(-0.3, 0.82, 0.05);
            s.hands[1].set(0.3, 0.82, 0.05);
            s.sip = 0;
            s.chin = 0;
            s.smile = 0;
            s.talk = 0;
            s.mugPos = null;
            s.mugHand = 0;
          };
          const sitPose = (s, hipY, footZ = 0.5) => {
            standPose(s, hipY);
            s.lean = 0.05;
            s.feet[0].set(-0.12, 0, footZ);
            s.feet[1].set(0.12, 0, footZ);
            s.hands[0].set(-0.22, hipY + 0.12, 0.28);
            s.hands[1].set(0.22, hipY + 0.12, 0.28);
          };
          const gait = (s, realDist, amp, hipY = 0.88) => {
            const phase = realDist * 4;
            s.hip.set(0, hipY - 0.015 * Math.abs(Math.sin(phase)) * amp, 0);
            [0, 1].forEach(i => {
              const sg = i === 0 ? -1 : 1;
              const ph = phase + (i === 0 ? 0 : Math.PI);
              s.feet[i].set(sg * 0.11, 0.1 * Math.max(0, -Math.sin(ph)) * amp, 0.25 * Math.cos(ph) * amp);
            });
            return phase;
          };
          const swingArms = (s, phase, amp, shoulderY) => {
            [0, 1].forEach(i => {
              const sg = i === 0 ? -1 : 1;
              const sw = Math.sin(phase + (i === 0 ? Math.PI : 0)) * 0.45 * amp;
              s.hands[i].set(sg * 0.27, shoulderY - 0.57 * Math.cos(sw), 0.02 + 0.57 * Math.sin(sw));
            });
          };

          const addCtx = (parent, idx, kind, F) => {
            const ctx = { parent, idx, kind, F };
            ctx.obs = (name, cx, cy, cz, sx, sy, sz) => homeLife.obstacles.push({ plot: idx, name, min: [cx - sx / 2, cy - sy / 2, cz - sz / 2], max: [cx + sx / 2, cy + sy / 2, cz + sz / 2] });
            ctx.blk = (name, w, h, d, x, y, z, mat, solid = true) => {
              const mesh = addMesh(parent, box(w, h, d), mat, x, y, z);
              if (solid) ctx.obs(name, x, y, z, w, h, d);
              return mesh;
            };
            ctx.cyl = (name, r, h, x, y, z, mat, solid = true, seg = 12) => {
              const mesh = addMesh(parent, new THREE.CylinderGeometry(r, r, h, seg), mat, x, y, z);
              if (solid) ctx.obs(name, x, y, z, r * 2, h, r * 2);
              return mesh;
            };
            return ctx;
          };

          const follow = (mesh, actor, handIdx, off, yawExtra = 0) => {
            const hand = actor.person.hands[handIdx];
            const tmp = V(hand.x + off.x, hand.y + off.y, hand.z + off.z);
            actor.toWorld(tmp, mesh.position);
            mesh.rotation.y = actor.root.rotation.y + yawExtra;
          };

          const screenQuad = (parent, screen, w, h, x, y, z, rotY) => {
            const quad = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: screen.texture }));
            quad.position.set(x, y, z);
            quad.rotation.y = rotY;
            parent.add(quad);
            return quad;
          };

          const addLamp = (ctx, x, y, z, lamps) => {
            const lamp = new THREE.Mesh(box(0.34, 0.03, 0.34), new THREE.MeshBasicMaterial({ color: 0xf3e6a8 }));
            lamp.position.set(x, y, z);
            lamp.userData.dayColor = 0xdfe6ea;
            ctx.parent.add(lamp);
            lamps.push(lamp);
          };
