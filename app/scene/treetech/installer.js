        // Técnico da Treetech: instala e configura o TM (em pé) e o GMP (agachado) em loop
        const installer = { update: null, obstacles: [], cables: [], debug: {} };
        const buildInstaller = () => {
          const V = (x, y, z) => new THREE.Vector3(x, y, z);
          const stdMat = (color, roughness = 0.6) => new THREE.MeshStandardMaterial({ color, roughness });
          const skinMat = stdMat('#f1c7a1', 0.8);
          const darkMat = stdMat('#1f2429', 0.5);
          const pantsMat = stdMat('#2f3b52', 0.8);
          const shirtMat = stdMat('#d9dee2', 0.7);
          const vestMat = stdMat('#2f9e5e', 0.6);
          const bootMat = stdMat('#2b2420', 0.8);
          const gloveMat = stdMat('#e07a1a', 0.7);
          const stripeMat = stdMat('#dfe6e9', 0.3);
          const beltMat = stdMat('#6b4a2f', 0.8);
          const metalMat2 = stdMat('#9aa4ad', 0.3);
          const orangeMat = stdMat('#e07a1a', 0.6);
          const padMat = stdMat('#3a4048', 0.7);
          const lensMat = new THREE.MeshStandardMaterial({ color: '#9fd0e8', roughness: 0.2, transparent: true, opacity: 0.35 });
          const addMesh = (parent, geo, material, x, y, z) => {
            const mesh = new THREE.Mesh(geo, material);
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            parent.add(mesh);
            return mesh;
          };
          const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
          const aabb = (name, cx, cy, cz, sx, sy, sz) => installer.obstacles.push({ name, min: [cx - sx / 2, cy - sy / 2, cz - sz / 2], max: [cx + sx / 2, cy + sy / 2, cz + sz / 2] });

          const rig = new THREE.Group();
          substationGroup.add(rig);
          const propsGroup = new THREE.Group();
          scene.add(propsGroup);
          installer.rig = rig;
          installer.props = propsGroup;
          const upper = new THREE.Group();
          rig.add(upper);

          addMesh(upper, box(0.42, 0.2, 0.26), pantsMat, 0, -0.02, 0);
          addMesh(upper, box(0.46, 0.5, 0.27), shirtMat, 0, 0.3, 0);
          [-1, 1].forEach(s => {
            addMesh(upper, box(0.15, 0.5, 0.012), vestMat, s * 0.14, 0.3, 0.141);
            addMesh(upper, box(0.15, 0.03, 0.014), stripeMat, s * 0.14, 0.18, 0.142);
            addMesh(upper, box(0.15, 0.03, 0.014), stripeMat, s * 0.14, 0.4, 0.142);
            addMesh(upper, box(0.1, 0.02, 0.29), vestMat, s * 0.16, 0.555, 0);
          });
          addMesh(upper, box(0.47, 0.5, 0.012), vestMat, 0, 0.3, -0.141);
          addMesh(upper, box(0.47, 0.03, 0.014), stripeMat, 0, 0.18, -0.142);
          addMesh(upper, box(0.47, 0.03, 0.014), stripeMat, 0, 0.42, -0.142);
          addMesh(upper, box(0.47, 0.065, 0.285), beltMat, 0, 0.1, 0);
          addMesh(upper, box(0.09, 0.11, 0.06), beltMat, 0.2, 0.05, 0.12);
          addMesh(upper, box(0.09, 0.11, 0.06), beltMat, -0.2, 0.05, 0.12);
          addMesh(upper, box(0.05, 0.05, 0.05), metalMat2, -0.13, 0.1, 0.16);
          addMesh(upper, box(0.06, 0.1, 0.04), darkMat, -0.17, 0.46, 0.156);
          addMesh(upper, new THREE.CylinderGeometry(0.004, 0.004, 0.1, 5), darkMat, -0.18, 0.55, 0.156);
          addMesh(upper, new THREE.CylinderGeometry(0.05, 0.055, 0.08, 8), skinMat, 0, 0.6, 0);

          const logoCanvas = document.createElement('canvas');
          logoCanvas.width = 256;
          logoCanvas.height = 96;
          const lctx = logoCanvas.getContext('2d');
          lctx.fillStyle = '#2f9e5e';
          lctx.fillRect(0, 0, 256, 96);
          lctx.fillStyle = '#ffffff';
          lctx.font = 'bold 44px Arial, sans-serif';
          lctx.textAlign = 'center';
          lctx.textBaseline = 'middle';
          lctx.fillText('TREETECH', 128, 50);
          const logo = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.12), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(logoCanvas) }));
          logo.position.set(0, 0.3, -0.15);
          logo.rotation.y = Math.PI;
          upper.add(logo);

          const head = new THREE.Group();
          head.position.set(0, 0.64, 0);
          upper.add(head);
          addMesh(head, new THREE.SphereGeometry(0.15, 14, 10), skinMat, 0, 0.14, 0);
          const helmet = addMesh(head, new THREE.SphereGeometry(0.175, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), stdMat('#f4f7f5', 0.4), 0, 0.2, 0);
          helmet.rotation.x = -0.12;
          addMesh(head, new THREE.CylinderGeometry(0.2, 0.2, 0.018, 16), stdMat('#f4f7f5', 0.4), 0, 0.2, 0.02);
          addMesh(head, box(0.05, 0.14, 0.012), stdMat('#2f9e5e', 0.4), 0, 0.3, 0.12).rotation.x = 0.55;
          addMesh(head, new THREE.SphereGeometry(0.02, 6, 6), skinMat, 0, 0.12, 0.15);
          [-0.15, 0.15].forEach(ex => addMesh(head, new THREE.SphereGeometry(0.03, 6, 6), skinMat, ex, 0.14, 0));
          [-0.1, 0.1].forEach(sx => addMesh(head, box(0.012, 0.1, 0.012), darkMat, sx, 0.05, 0.06));
          const eyes = [-0.055, 0.055].map(ex => addMesh(head, new THREE.SphereGeometry(0.018, 8, 6), darkMat, ex, 0.15, 0.138));
          [-0.055, 0.055].forEach(ex => {
            addMesh(head, box(0.08, 0.06, 0.008), darkMat, ex, 0.15, 0.146);
            addMesh(head, box(0.064, 0.044, 0.01), lensMat, ex, 0.15, 0.151);
            addMesh(head, box(0.01, 0.01, 0.14), darkMat, ex * 2.5, 0.15, 0.07);
          });
          addMesh(head, box(0.05, 0.01, 0.01), stdMat('#a8525a'), 0, 0.07, 0.143);

          const makeSeg = (len, r, material) => {
            const group = new THREE.Group();
            addMesh(group, new THREE.CylinderGeometry(r, r * 0.9, len, 8), material, 0, -len / 2, 0);
            rig.add(group);
            return group;
          };
          const makeBall = (r, material, sy = 1) => {
            const ball = addMesh(rig, new THREE.SphereGeometry(r, 8, 6), material, 0, 0, 0);
            ball.scale.y = sy;
            return ball;
          };
          const THIGH = 0.43, SHIN = 0.41, UARM = 0.3, FARM = 0.3, ANKLE = 0.07;
          const legs = [-1, 1].map(s => {
            const boot = new THREE.Group();
            addMesh(boot, box(0.12, 0.09, 0.28), bootMat, 0, 0.045, 0.06);
            addMesh(boot, box(0.125, 0.02, 0.29), darkMat, 0, 0.01, 0.06);
            rig.add(boot);
            return { s, thigh: makeSeg(THIGH, 0.075, pantsMat), shin: makeSeg(SHIN, 0.06, pantsMat), knee: makeBall(0.07, padMat, 1.1), boot };
          });
          const arms = [-1, 1].map(s => ({ s, upper: makeSeg(UARM, 0.055, shirtMat), fore: makeSeg(FARM, 0.048, shirtMat), elbow: makeBall(0.056, shirtMat), hand: makeBall(0.07, gloveMat), cuff: makeSeg(0.07, 0.056, gloveMat) }));
          const armL = arms[0];
          const armR = arms[1];

          const drill = new THREE.Group();
          addMesh(drill, new THREE.CylinderGeometry(0.035, 0.035, 0.17, 8), orangeMat, 0, 0, 0.0).rotation.x = Math.PI / 2;
          addMesh(drill, box(0.05, 0.11, 0.07), darkMat, 0, -0.07, -0.03);
          addMesh(drill, box(0.06, 0.04, 0.09), darkMat, 0, -0.14, -0.03);
          addMesh(drill, new THREE.CylinderGeometry(0.02, 0.02, 0.04, 8), metalMat2, 0, 0, 0.1).rotation.x = Math.PI / 2;
          const bit = addMesh(drill, new THREE.CylinderGeometry(0.006, 0.006, 0.05, 6), metalMat2, 0, 0, 0.17);
          bit.rotation.x = Math.PI / 2;
          rig.add(drill);

          const tabletCanvas = document.createElement('canvas');
          tabletCanvas.width = 160;
          tabletCanvas.height = 220;
          const tctx = tabletCanvas.getContext('2d');
          tctx.fillStyle = '#16324a';
          tctx.fillRect(0, 0, 160, 220);
          tctx.fillStyle = BRAND_GREEN;
          tctx.fillRect(0, 0, 160, 34);
          tctx.fillStyle = '#ffffff';
          tctx.font = 'bold 18px Arial, sans-serif';
          tctx.fillText('Configurar', 10, 24);
          [60, 100, 140, 180].forEach((ry, i) => {
            tctx.fillStyle = '#2d5a7a';
            tctx.fillRect(10, ry, 140, 24);
            tctx.fillStyle = i % 2 ? '#6fbf8a' : '#8fb4c8';
            tctx.fillRect(14, ry + 4, 40 + i * 20, 16);
          });
          const tablet = new THREE.Group();
          addMesh(tablet, box(0.22, 0.3, 0.015), darkMat, 0, 0, 0);
          const tabletScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.275), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(tabletCanvas) }));
          tabletScreen.rotation.y = Math.PI;
          tabletScreen.position.z = -0.0085;
          tablet.add(tabletScreen);
          rig.add(tablet);

          const makeIndicator = (x, y, z) => {
            const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshBasicMaterial({ color: '#4aa8ff' }));
            lamp.position.set(x, y, z);
            lamp.visible = false;
            propsGroup.add(lamp);
            return lamp;
          };

          const toolbox = new THREE.Group();
          addMesh(toolbox, box(0.5, 0.2, 0.28), orangeMat, 0, 0.1, 0);
          addMesh(toolbox, box(0.2, 0.03, 0.04), darkMat, 0, 0.22, 0);
          toolbox.position.set(2.9, 0.35, 1.0);
          propsGroup.add(toolbox);
          aabb('caixa-ferramentas', 2.9, 0.47, 1.0, 0.5, 0.24, 0.28);
          const drum = addMesh(propsGroup, new THREE.CylinderGeometry(0.24, 0.24, 0.22, 14), stdMat('#c9b89a', 0.7), 4.3, 0.6, -1.0);
          drum.rotation.x = Math.PI / 2;
          addMesh(drum, new THREE.CylinderGeometry(0.1, 0.1, 0.26, 10), darkMat, 0, 0, 0);
          aabb('carretel', 4.3, 0.6, -1.0, 0.48, 0.48, 0.26);
          [[2.15, 1.1], [3.2, 1.35], [4.3, 0.1], [2.9, -2.3]].forEach(([cx, cz]) => {
            const cone = addMesh(propsGroup, new THREE.ConeGeometry(0.1, 0.3, 10), stdMat('#ff7a1a', 0.5), cx, 0.5, cz);
            addMesh(cone, new THREE.CylinderGeometry(0.075, 0.085, 0.05, 10), stripeMat, 0, 0.02, 0);
            aabb('cone', cx, 0.5, cz, 0.2, 0.3, 0.2);
          });

          const makeStation = (cfg) => {
            const anchor = new THREE.Object3D();
            anchor.position.set(cfg.pos[0], 0.35, cfg.pos[1]);
            anchor.rotation.y = cfg.facing;
            anchor.updateMatrixWorld(true);
            const k = cfg.scale;
            const onFace = (mz, my, n) => anchor.worldToLocal(V(cfg.face.x + n, cfg.face.y + my * k, cfg.face.z + mz * k));
            const lamp = makeIndicator(cfg.face.x + 0.012, cfg.face.y + 0.15 * k, cfg.face.z - 0.2 * k);

            [[0.1, 0.15], [0.22, 0.15], [0.1, 0.02], [0.22, 0.02]].forEach(([mz, my]) => {
              const screw = addMesh(propsGroup, new THREE.CylinderGeometry(0.02, 0.02, 0.012, 8), metalMat2, cfg.face.x + 0.006, cfg.face.y + my * k, cfg.face.z + mz * k);
              screw.rotation.z = Math.PI / 2;
              screw.castShadow = false;
            });
            const plugPos = V(cfg.face.x, cfg.face.y - 0.05 * k, cfg.face.z + 0.12 * k);
            const port = addMesh(propsGroup, new THREE.CylinderGeometry(0.04, 0.04, 0.012, 10), darkMat, plugPos.x + 0.006, plugPos.y, plugPos.z);
            port.rotation.z = Math.PI / 2;
            const plug = addMesh(propsGroup, new THREE.CylinderGeometry(0.028, 0.028, 0.09, 10), stdMat('#3a4048', 0.5), plugPos.x + 0.05, plugPos.y, plugPos.z);
            plug.rotation.z = Math.PI / 2;
            const plugRing = addMesh(propsGroup, new THREE.CylinderGeometry(0.034, 0.034, 0.02, 10), orangeMat, plugPos.x + 0.07, plugPos.y, plugPos.z);
            plugRing.rotation.z = Math.PI / 2;

            const curve = new THREE.CatmullRomCurve3(cfg.cable.map(p => V(...p)));
            const cableMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 28, 0.014, 6), stdMat('#23282e', 0.6));
            cableMesh.castShadow = true;
            propsGroup.add(cableMesh);
            installer.cables.push(curve.getPoints(60).slice(12));
            const jb = cfg.box;
            addMesh(propsGroup, box(0.3, 0.2, 0.2), stdMat('#7a8793', 0.5), jb[0], jb[1], jb[2]);
            aabb('caixa-juncao', jb[0], jb[1], jb[2], 0.3, 0.2, 0.2);

            const puffs = [0, 1, 2, 3].map(() => {
              const puff = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ color: '#d8d2c4', transparent: true, opacity: 0, depthWrite: false }));
              puff.visible = false;
              propsGroup.add(puff);
              return puff;
            });
            const screws = [[0.1, 0.15], [0.22, 0.15], [0.1, 0.02], [0.22, 0.02]];
            return {
              ...cfg,
              anchor,
              lamp,
              puffs,
              screws,
              onFace,
              screwWorld: screws.map(([mz, my]) => V(cfg.face.x + 0.03, cfg.face.y + my * k, cfg.face.z + mz * k)),
              handHold: onFace(-0.2, 0.0, 0.09),
              plugGrip: onFace(0.12, -0.05, 0.1)
            };
          };

          const stations = [
            makeStation({
              pos: [2.5, 0.23], facing: -Math.PI / 2, face: V(1.92, 1.9, 0.35), scale: 1,
              feet: [[-0.11, 0.03], [0.11, -0.03]],
              hipY: [0.9, 0.9, 0.9, 0.9], shift: [0.2, 0.14, 0, 0], lean: [0.12, 0.1, 0.1, 0.02], headX: [0.1, 0.15, 0.3, 0.1],
              cable: [[1.99, 1.85, 0.47], [2.02, 1.5, 0.49], [2.02, 0.8, 0.52], [2.05, 0.42, 0.7], [2.1, 0.4, 1.0], [2.1, 0.42, 1.16]],
              box: [2.1, 0.45, 1.28]
            }),
            makeStation({
              pos: [3.3, -1.4], facing: -Math.PI / 2, face: V(2.72, 0.64, -1.3), scale: 1.375,
              feet: [[-0.15, 0.0], [0.15, 0.0]],
              hipY: [0.42, 0.42, 0.55, 0.56], shift: [0.06, 0.06, -0.12, 0], lean: [0.7, 0.7, 0.3, 0.25], headX: [0.15, 0.3, 0.3, 0.1],
              cable: [[2.81, 0.57, -1.135], [2.79, 0.45, -1.17], [2.78, 0.37, -1.35], [2.78, 0.37, -1.6], [2.78, 0.4, -1.88]],
              box: [2.8, 0.45, -2.0]
            })
          ];
          const route = makePath([[2.5, 0.23], [3.06, 0.23], [3.06, -1.4], [3.3, -1.4]], 'pingpong');
          const WORK = 14;
          const WALK = 3.3;
          const CYCLE = 2 * (WORK + WALK);
          const bounds = [0, 4.5, 8, 12.5, 14];
          const lampBlue = new THREE.Color('#4aa8ff');
          const lampGreen = new THREE.Color('#6fdf8a');
          const DOWN = V(0, -1, 0);

          const ss = (a, b, x) => {
            const q = Math.min(1, Math.max(0, (x - a) / (b - a)));
            return q * q * (3 - 2 * q);
          };
          const lerpAngle = (a, b, q) => a + (((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI) * q;
          const phaseWeights = (u) => {
            const h = 0.35;
            return [
              1 - ss(bounds[1] - h, bounds[1] + h, u),
              ss(bounds[1] - h, bounds[1] + h, u) - ss(bounds[2] - h, bounds[2] + h, u),
              ss(bounds[2] - h, bounds[2] + h, u) - ss(bounds[3] - h, bounds[3] + h, u),
              ss(bounds[3] - h, bounds[3] + h, u)
            ];
          };

          const tmpDir = V(0, 0, 0);
          const tmpPole = V(0, 0, 0);
          const ik = { mid: V(0, 0, 0), end: V(0, 0, 0), err: 0 };
          const solve = (root, target, a, b, pole) => {
            tmpDir.subVectors(target, root);
            const d = tmpDir.length();
            const reach = Math.min(a + b - 0.002, Math.max(Math.abs(a - b) + 0.02, d));
            tmpDir.normalize();
            const x = (a * a - b * b + reach * reach) / (2 * reach);
            const h = Math.sqrt(Math.max(0, a * a - x * x));
            tmpPole.copy(pole).addScaledVector(tmpDir, -pole.dot(tmpDir)).normalize();
            ik.mid.copy(root).addScaledVector(tmpDir, x).addScaledVector(tmpPole, h);
            ik.end.copy(root).addScaledVector(tmpDir, reach);
            ik.err = Math.abs(d - reach);
          };
          const aim = (group, from, to) => {
            group.position.copy(from);
            tmpDir.subVectors(to, from).normalize();
            group.quaternion.setFromUnitVectors(DOWN, tmpDir);
          };

          const hip = V(0, 0.88, 0);
          const sh = V(0, 0, 0);
          const handTarget = [V(0, 0, 0), V(0, 0, 0)];
          const footTarget = [V(0, 0, 0), V(0, 0, 0)];
          const tmp = V(0, 0, 0);
          const tabletPos = V(0, 0, 0);
          const poleLeg = V(0, 0.1, 1);
          const poleArm = V(0, -0.8, -0.2);

          const leanPoint = (out, x, y, z, lean) => out.set(x, y * Math.cos(lean) - z * Math.sin(lean), y * Math.sin(lean) + z * Math.cos(lean));
          const tabletPoint = (out, x, y, z) => out.set(x, y, z).applyMatrix4(tablet.matrix);

          // Ciclo: trabalha no TM, anda até o GMP, trabalha, volta; em cada estação: fixa, conecta, configura, confere
          installer.update = (time) => {
            if (installer.disabled) return;
            const m = time % CYCLE;
            const walking = (m >= WORK && m < WORK + WALK) || m >= 2 * WORK + WALK;
            const blink = time % 4.6 < 0.12 ? 0.1 : 1;
            eyes.forEach(eye => eye.scale.y = blink);
            stations.forEach(st => { st.lamp.visible = false; st.puffs.forEach(p => p.visible = false); });

            let hipY = 0.88, shift = 0, lean = 0.03, headX = 0, headY = 0, drillAmt = 0, tabletAmt = 0;
            let st = null, u = 0, w = null, engage = 0;

            if (walking) {
              const back = m >= 2 * WORK + WALK;
              u = back ? m - 2 * WORK - WALK : m - WORK;
              const p = ss(0, 1, u / WALK);
              const dist = back ? route.total + p * route.total : p * route.total;
              const s = samplePath(route, dist);
              const from = back ? stations[1].facing : stations[0].facing;
              const to = back ? stations[0].facing : stations[1].facing;
              rig.position.set(s.x, 0.35, s.z);
              rig.rotation.y = lerpAngle(lerpAngle(from, s.heading, ss(0, 0.5, u)), to, ss(WALK - 0.5, WALK, u));
              const amp = Math.min(1, Math.sin(Math.PI * p) * 2.5);
              const phase = dist * 4;
              hipY = 0.88 - 0.015 * Math.abs(Math.sin(phase));
              [0, 1].forEach(i => {
                const sg = i === 0 ? -1 : 1;
                const ph = phase + (i === 0 ? 0 : Math.PI);
                footTarget[i].set(sg * 0.11, 0.1 * Math.max(0, -Math.sin(ph)) * amp, 0.25 * Math.cos(ph) * amp);
              });
              hip.set(0, hipY, 0);
              upper.position.copy(hip);
              upper.rotation.x = lean;
              [0, 1].forEach(i => {
                const sg = i === 0 ? -1 : 1;
                leanPoint(sh, sg * 0.27, 0.53, 0, lean).add(hip);
                const swing = Math.sin(phase + (i === 0 ? Math.PI : 0)) * 0.5 * amp;
                handTarget[i].set(sh.x, sh.y - 0.57 * Math.cos(swing), sh.z + 0.57 * Math.sin(swing));
              });
              installer.debug.mode = 'walk';
            } else {
              const idx = m < WORK ? 0 : 1;
              u = idx === 0 ? m : m - WORK - WALK;
              st = stations[idx];
              w = phaseWeights(u);
              engage = ss(0, 0.6, u) * (1 - ss(WORK - 0.6, WORK, u));
              const mixp = (arr, neutral) => neutral + (arr.reduce((sum, v, i) => sum + v * w[i], 0) - neutral) * engage;
              rig.position.set(st.pos[0], 0.35, st.pos[1]);
              rig.rotation.y = st.facing;
              hipY = mixp(st.hipY, 0.88);
              shift = mixp(st.shift, 0);
              lean = mixp(st.lean, 0.03);
              headX = mixp(st.headX, 0);
              hip.set(0, hipY, shift);
              upper.position.copy(hip);
              upper.rotation.x = lean;
              [0, 1].forEach(i => footTarget[i].set(st.feet[i][0] * engage + (i === 0 ? -0.11 : 0.11) * (1 - engage), 0, st.feet[i][1] * engage));

              [0, 1].forEach(i => {
                const sg = i === 0 ? -1 : 1;
                leanPoint(sh, sg * 0.27, 0.53, 0, lean).add(hip);
                handTarget[i].set(sh.x, sh.y - 0.57, sh.z + 0.02);
              });

              // posição do tablet: pendurado no peito ou nas mãos
              tabletAmt = w[2] * engage;
              leanPoint(tmp, 0, 0.36, 0.19, lean).add(hip);
              tabletPos.copy(tmp);
              leanPoint(tmp, 0, 0.53, 0, lean).add(hip);
              tmp.set(-0.04, tmp.y - 0.18, tmp.z + 0.28);
              tabletPos.lerp(tmp, tabletAmt);
              tablet.position.copy(tabletPos);
              tablet.rotation.x = lean * (1 - tabletAmt) + (lean * 0.5 + 0.5) * tabletAmt + 0.05;
              tablet.updateMatrix();

              const wanted = [V(0, 0, 0), V(0, 0, 0)];
              const k0 = Math.min(3, Math.floor(u / 1.1));
              const f = Math.min(1, (u - k0 * 1.1) / 1.1);
              const drilling = w[0] > 0.5 && f > 0.3 && f < 0.8 && u < 4.5;
              const approach = 0.09 * (1 - ss(0.05, 0.3, f)) + 0.09 * ss(0.8, 1, f);
              const a = st.screwWorld[k0];
              const b = st.screwWorld[Math.min(3, k0 + 1)];
              tmp.lerpVectors(a, b, ss(0.8, 1, f));
              tmp.x += approach + (drilling ? Math.sin(time * 90) * 0.002 : 0);
              if (drilling) tmp.y += Math.sin(time * 97) * 0.002;
              rig.updateMatrixWorld(true);
              const tipLocal = rig.worldToLocal(tmp.clone());
              const drillHand = tipLocal.clone().sub(V(0, 0, 0.195));
              const plugAt = st.plugGrip.clone();
              plugAt.x += Math.cos(time * 6) * 0.012;
              plugAt.y += Math.sin(time * 6) * 0.012;

              const tapR = V(0, 0, 0);
              tabletPoint(tapR, 0.05 * Math.sin(time * 2.3) + 0.02, 0.04 * Math.sin(time * 4.1 + 1) + 0.02, -0.075);
              const tapL = V(0, 0, 0);
              tabletPoint(tapL, -0.13, -0.08, -0.075);
              const upHand = V(sh.x + 0.1, sh.y + 0.45 + Math.sin(time * 10) * 0.02, sh.z + 0.2);
              const hipHand = V(-0.31, hipY + 0.05, shift + 0.02);

              wanted[1].set(0, 0, 0).addScaledVector(drillHand, w[0]).addScaledVector(plugAt, w[1]).addScaledVector(tapR, w[2]).addScaledVector(upHand, w[3]);
              wanted[0].set(0, 0, 0).addScaledVector(st.handHold, w[0] + w[1]).addScaledVector(tapL, w[2]).addScaledVector(hipHand, w[3]);
              handTarget[0].lerp(wanted[0], engage);
              handTarget[1].lerp(wanted[1], engage);

              drillAmt = w[0] * engage;
              headX += (Math.sin(time * 2.2) * 0.12) * w[2] + Math.sin(time * 8) * 0.1 * w[3];
              headY = Math.sin(time * 1.1) * 0.1 * w[1];

              if (w[2] > 0.5) {
                st.lamp.visible = Math.sin(time * 9) > 0;
                st.lamp.material.color.copy(lampBlue);
              } else if (w[3] > 0.5) {
                st.lamp.visible = true;
                st.lamp.material.color.copy(lampGreen);
              }
              if (drilling) {
                const q = (f - 0.3) / 0.5;
                const puff = st.puffs[k0];
                puff.visible = true;
                puff.position.copy(st.screwWorld[k0]);
                puff.position.x += 0.03 + q * 0.06;
                puff.scale.setScalar(0.015 + q * 0.04);
                puff.material.opacity = (1 - q) * 0.5;
              }
              installer.debug.mode = 'work' + idx;
            }
            if (walking) {
              tabletPos.set(0, 0, 0);
              leanPoint(tmp, 0, 0.36, 0.19, lean).add(hip);
              tablet.position.copy(tmp);
              tablet.rotation.x = lean + 0.05;
              tablet.updateMatrix();
            }

            upper.position.copy(hip);
            upper.rotation.x = lean;
            head.rotation.x = headX;
            head.rotation.y = headY;

            legs.forEach((leg, i) => {
              const root = V(leg.s * 0.1, hip.y - 0.02, hip.z);
              const ankle = footTarget[i].clone();
              ankle.y += ANKLE;
              poleLeg.x = leg.s * 0.08;
              solve(root, ankle, THIGH, SHIN, poleLeg);
              aim(leg.thigh, root, ik.mid);
              aim(leg.shin, ik.mid, ik.end);
              leg.knee.position.copy(ik.mid);
              leg.boot.position.copy(footTarget[i]);
            });

            arms.forEach((arm, i) => {
              leanPoint(sh, arm.s * 0.27, 0.53, 0, lean).add(hip);
              const shoulder = sh.clone();
              poleArm.x = arm.s * 1.0;
              solve(shoulder, handTarget[i], UARM, FARM, poleArm);
              installer.debug['err' + i] = ik.err;
              aim(arm.upper, shoulder, ik.mid);
              aim(arm.fore, ik.mid, ik.end);
              arm.elbow.position.copy(ik.mid);
              arm.hand.position.copy(ik.end);
              tmpDir.subVectors(ik.end, ik.mid).normalize();
              arm.cuff.position.copy(ik.end).addScaledVector(tmpDir, -0.03);
              arm.cuff.quaternion.setFromUnitVectors(DOWN, tmpDir);
            });

            drill.position.lerpVectors(V(0.25, hip.y + 0.0, hip.z), armR.hand.position, drillAmt);
            drill.rotation.x = (Math.PI / 2) * (1 - drillAmt);
            drill.position.z += 0.0;
            bit.rotation.y = time * 40;
          };
        };
        buildInstaller();
