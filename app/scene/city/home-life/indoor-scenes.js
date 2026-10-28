          // ---------- Cenas internas ----------
          const indoor = {};

          indoor.tv = (ctx, o) => {
            const { F, blk, parent } = ctx;
            const game = o.game;
            blk('movel-tv', 0.3, 0.16, 0.8, -1.5, F + 0.08, 0, woodMat);
            blk('tv', 0.07, 0.42, 0.78, -1.53, F + 0.16 + 0.21, 0, darkMat);
            const screen = makeHomeScreen(game ? 'game' : 'tv', o.seed);
            screenQuad(parent, screen, 0.72, 0.38, -1.49, F + 0.37, 0, Math.PI / 2);
            if (game) blk('console', 0.16, 0.04, 0.22, -1.48, F + 0.18, 0.5, darkMat, false);
            blk('sofa-assento', 0.5, 0.2, 1.1, 1.18, F + 0.1, 0, fabricMats[o.n % 4], false);
            ctx.obs('sofa-assento', 1.18, F + 0.165, 0, 0.5, 0.07, 1.1);
            blk('sofa-encosto', 0.14, 0.4, 1.1, 1.52, F + 0.2, 0, fabricMats[o.n % 4]);
            [-0.6, 0.6].forEach(z => blk('sofa-braco', 0.5, 0.3, 0.1, 1.18, F + 0.15, z, fabricMats[o.n % 4]));
            blk('mesa-centro', 0.4, 0.14, 0.6, 0.3, F + 0.07, 0, woodMat);
            const bowl = ctx.cyl('tigela', 0.06, 0.04, 1.18, F + 0.22, -0.1, orangeMat, false, 10);
            parent.add(bowl);
            ctx.blk('tapete', 1.6, 0.01, 1.2, 0.3, F + 0.005, 0, rugMat, false);
            ctx.cyl('abajur-haste', 0.015, 1.0, 1.5, F + 0.5, -1.2, metalMat, false, 6);
            const shade = ctx.cyl('abajur', 0.12, 0.18, 1.5, F + 1.05, -1.2, stdMat('#f3e6a8', 0.5), false);
            shade.material = lightMat(0xf3e6a8);
            ctx.obs('abajur', 1.5, F + 0.5, -1.2, 0.26, 1.1, 0.26);
            const remote = addMesh(parent, box(0.15, 0.02, 0.05), darkMat, 0, 0, 0);

            const actor = makeActor(ctx, o.n, 1.24, F, 0.16, -Math.PI / 2);
            const s = actor.s;
            const bowlPos = V(1.18, F + 0.26, -0.1);
            const bowlL = V(0, 0, 0);
            const pointAt = V(0, 0, 0);
            const t = V(0, 0, 0);
            const cycle = 22;
            addTicker((time) => {
              const u = (time + o.phase) % cycle;
              const n = Math.floor((time + o.phase) / cycle);
              const wEat = win(5, 5.8, 7.6, 8.4, u);
              const lift = win(6.1, 6.9, 7.1, 7.8, u);
              const laugh = win(10, 10.4, 12, 12.4, u);
              const wPoint = win(14, 14.6, 15.4, 16, u);
              sitPose(s, 0.63, 0.55);
              s.lean = 0.04 + (game ? 0.22 : 0) + 0.03 * Math.sin(time * 30) * laugh;
              actor.toLocal(bowlPos.x, bowlPos.y, bowlPos.z, bowlL);
              s.hands[0].set(-0.22, 0.58, 0.3);
              s.hands[1].set(0.22, 0.58, 0.28);
              if (game) {
                s.hands[0].set(-0.1, 0.78 + Math.sin(time * 9) * 0.01, 0.4);
                s.hands[1].set(0.1, 0.78 + Math.sin(time * 11) * 0.01, 0.4);
                const cheer = win(14, 14.4, 17, 17.4, u);
                s.hands[0].lerp(V(-0.35, 1.6, 0.15), cheer);
                s.hands[1].lerp(V(0.35, 1.6, 0.15), cheer);
                s.smile = 0.9 * cheer;
              } else {
                s.hands[0].lerp(bowlL, wEat);
                s.sip = lift;
                pointAt.set(0.18, 1.3, 0.55);
                s.hands[1].lerp(pointAt, wPoint);
              }
              s.mugHand = 0;
              s.headX = 0.04 + Math.sin(time * 0.6 + o.n) * 0.03 + 0.12 * wEat;
              s.headY = Math.sin(time * 0.4) * 0.04;
              s.smile = Math.max(s.smile, 0.8 * laugh);
              s.talk = 0.4 * laugh * (0.5 + 0.5 * Math.sin(time * 14));
              screen.seed = o.seed + n * 0.17 + (u > 14.6 ? 0.17 : 0);
              actor.apply(time, true);
              if (game) {
                const mid = V((actor.person.hands[0].x + actor.person.hands[1].x) / 2, (actor.person.hands[0].y + actor.person.hands[1].y) / 2, (actor.person.hands[0].z + actor.person.hands[1].z) / 2);
                actor.toWorld(mid, remote.position);
                remote.rotation.y = actor.root.rotation.y + Math.PI / 2;
                remote.scale.set(1.1, 1, 1.4);
              } else {
                follow(remote, actor, 1, V(0, 0, 0.06), Math.PI / 2 * 0 + 0);
              }
              bowl.visible = true;
            });
          };

          indoor.kitchen = (ctx, o) => {
            const { F, blk, parent } = ctx;
            blk('geladeira', 0.34, 0.9, 0.36, -1.5, F + 0.45, -0.7, whiteMat, false);
            ctx.obs('geladeira-fundo', -1.65, F + 0.45, -0.7, 0.04, 0.9, 0.36);
            ctx.obs('geladeira-topo', -1.5, F + 0.89, -0.7, 0.34, 0.02, 0.36);
            const doorPivot = new THREE.Group();
            doorPivot.position.set(-1.325, F, -0.88);
            parent.add(doorPivot);
            addMesh(doorPivot, box(0.03, 0.88, 0.34), metalMat, 0, 0.45, 0.17);
            addMesh(doorPivot, box(0.04, 0.2, 0.03), darkMat, 0.02, 0.6, 0.3);
            blk('balcao', 0.4, 0.4, 1.0, -1.48, F + 0.2, 0.55, woodMat);
            blk('balcao-tampo', 0.44, 0.03, 1.04, -1.46, F + 0.415, 0.55, stdMat('#5a4a3a', 0.6));
            blk('microondas', 0.3, 0.2, 0.34, -1.5, F + 0.53, 0.5, stdMat('#dfe3e6', 0.4), false);
            ctx.obs('microondas-fundo', -1.63, F + 0.53, 0.5, 0.04, 0.2, 0.34);
            ctx.obs('microondas-topo', -1.5, F + 0.63, 0.5, 0.3, 0.02, 0.34);
            const mwDoor = new THREE.Group();
            mwDoor.position.set(-1.35, F + 0.53, 0.33);
            parent.add(mwDoor);
            addMesh(mwDoor, box(0.02, 0.16, 0.22), stdMat('#1f2429', 0.3), 0, 0, 0.11);
            const mwLight = new THREE.Mesh(box(0.012, 0.12, 0.17), new THREE.MeshBasicMaterial({ color: 0x222a30 }));
            mwLight.position.set(-1.355, F + 0.53, 0.44);
            parent.add(mwLight);
            const mwDisplay = addMesh(parent, box(0.012, 0.03, 0.06), new THREE.MeshBasicMaterial({ color: 0x1b4d2c }), -1.346, F + 0.53, 0.64, false);
            const plate = new THREE.Group();
            parent.add(plate);
            addMesh(plate, new THREE.CylinderGeometry(0.06, 0.06, 0.012, 12), whiteMat, 0, 0, 0);
            addMesh(plate, new THREE.SphereGeometry(0.035, 8, 6), stdMat('#d9a441', 0.6), 0, 0.02, 0);
            const tableOut = V(-1.5, F + 0.46, 0.15);
            ctx.blk('tapete', 1.2, 0.01, 1.2, -0.2, F + 0.005, 0, rugMat, false);
            blk('banqueta', 0.2, 0.2, 0.2, -0.9, F + 0.1, 1.0, woodMat);
            const outlet = V(-1.66, F + 0.5, 0.2);
            addMesh(parent, box(0.02, 0.06, 0.05), whiteMat, -1.675, F + 0.5, 0.2, false);

            const actor = makeActor(ctx, o.n, -0.95, F, -0.1, -Math.PI / 2);
            const s = actor.s;
            const cycle = 34;
            const zA = -0.18;
            const zB = 0.4;
            const t = V(0, 0, 0);
            const fork = addMesh(parent, box(0.012, 0.012, 0.09), metalMat, 0, 0, 0, false);
            const c = V(0, 0, 0);
            const seq = (u, keys) => {
              for (let i = 0; i < keys.length - 1; i++) if (u < keys[i + 1][0]) return keys[i][1] + (keys[i + 1][1] - keys[i][1]) * ss(keys[i][0], keys[i + 1][0], u);
              return keys[keys.length - 1][1];
            };
            addTicker((time) => {
              const u = (time + o.phase) % cycle;
              const fridgeOpen = win(1, 2.2, 3.2, 4.4, u) * 1.5;
              doorPivot.rotation.y = -fridgeOpen;
              mwDoor.rotation.y = -win(7, 8, 10, 11, u) * 1.5 - win(21, 22, 24, 25, u) * 1.5;
              const cooking = u > 11.5 && u < 20.5;
              mwLight.material.color.setHex(cooking ? 0xffe9a8 : 0x222a30);
              mwDisplay.material.color.setHex(cooking ? 0x7dffa5 : (u > 20.5 && u < 22 && Math.floor(time * 4) % 2 === 0 ? 0xffffff : 0x1b4d2c));
              plate.visible = true;
              const z = seq(u, [[0, zA], [5, zA], [6.5, zB], [26, zB], [27.5, zA], [34, zA]]);
              const walking = (u > 5 && u < 6.5) || (u > 26 && u < 27.5);
              const dir = u < 20 ? 1 : -1;
              actor.root.position.z = z;
              const yawTarget = walking ? (u < 20 ? 0 : Math.PI) : -Math.PI / 2;
              const turnIn = u < 20 ? ss(5, 5.4, u) * (1 - ss(6.1, 6.5, u)) : ss(26, 26.4, u) * (1 - ss(27.1, 27.5, u));
              actor.root.rotation.y = lerpAngle(-Math.PI / 2, yawTarget, turnIn);
              standPose(s, 0.88);
              if (walking) {
                const p = ss(0, 1, u < 20 ? (u - 5) / 1.5 : (u - 26) / 1.5);
                const amp = Math.min(1, Math.sin(Math.PI * p) * 2.5);
                const ph = gait(s, (z - zA) / SC + 3, amp);
                swingArms(s, ph, amp, 1.41);
              }
              s.lean = 0.04;
              const reachFridge = win(2, 2.8, 3.4, 4, u);
              actor.toLocal(-1.35, F + 0.55, -0.7, c);
              const platePos = V(0, 0, 0);
              const handCarry = V(-0.12, 1.1, 0.3);
              const wInMw = win(8, 8.6, 9.4, 10.2, u);
              actor.toLocal(-1.4, F + 0.5, 0.5, t);
              const wPress = win(10.2, 10.8, 11.6, 12.2, u);
              const wTake = win(21.5, 22.2, 22.6, 23.4, u);
              const carrying = (u > 3.4 && u < 8.6) || (u > 22.4);
              const eat = win(23.4, 24, 26, 26.6, u);
              s.hands[0].lerp(c, reachFridge);
              s.hands[0].lerp(t, wInMw + wTake);
              actor.toLocal(-1.36, F + 0.52, 0.64, platePos);
              s.hands[1].lerp(platePos, wPress);
              if (carrying) s.hands[1].lerp(handCarry, 1);
              s.sip = eat * (0.5 + 0.5 * Math.sin(time * 2.2));
              s.mugHand = 0;
              s.headX = 0.1 * (cooking ? 1 : 0) + Math.sin(time * 0.5) * 0.03;
              s.headY = 0;
              s.smile = 0.6 * eat;
              actor.apply(time);
              if (carrying || u > 22.4) {
                const hand = actor.person.hands[1];
                actor.toWorld(V(hand.x, hand.y + 0.02, hand.z + 0.03), plate.position);
                plate.rotation.set(0, 0, 0);
              } else if (u >= 8.6 && u <= 21.8) {
                plate.position.set(-1.5, F + 0.465, 0.5 + 0.0);
                plate.rotation.y = cooking ? time * 1.5 : 0;
              } else {
                plate.position.set(-1.5, F + 0.65, -0.7);
              }
              plate.scale.setScalar(0.9);
              follow(fork, actor, 0, V(0, 0, 0.05));
              fork.visible = u > 23.4 && u < 26.6;
            });
          };

          indoor.office = (ctx, o) => {
            const { F, blk, parent } = ctx;
            blk('mesa-tampo', 0.5, 0.04, 1.0, -1.43, F + 0.45, 0, woodMat);
            [-0.45, 0.45].forEach(z => blk('mesa-lado', 0.5, 0.43, 0.04, -1.43, F + 0.215, z, woodMat));
            blk('monitor', 0.04, 0.26, 0.42, -1.55, F + 0.62, 0, darkMat);
            blk('monitor-pe', 0.1, 0.06, 0.16, -1.52, F + 0.5, 0, darkMat);
            const screen = makeHomeScreen(o.screen || 'code', o.seed);
            screenQuad(parent, screen, 0.39, 0.23, -1.527, F + 0.62, 0, Math.PI / 2);
            blk('teclado', 0.1, 0.012, 0.3, -1.28, F + 0.476, 0, darkMat);
            blk('mouse', 0.04, 0.02, 0.03, -1.26, F + 0.48, -0.2, darkMat);
            const mugBody = ctx.cyl('caneca', 0.025, 0.05, -1.3, F + 0.5, 0.26, stdMat('#c0504a', 0.5), false, 10);
            blk('cadeira-assento', 0.3, 0.03, 0.3, -0.92, F + 0.26, 0, darkMat);
            blk('cadeira-encosto', 0.04, 0.32, 0.3, -0.76, F + 0.44, 0, darkMat);
            ctx.cyl('cadeira-haste', 0.02, 0.24, -0.92, F + 0.12, 0, metalMat, false, 6);
            blk('estante', 0.3, 1.3, 0.6, 1.5, F + 0.65, -0.7, woodMat);
            [0.3, 0.7, 1.1].forEach(y => blk('livros', 0.26, 0.12, 0.5, 1.48, F + y, -0.7, stdMat('#8a5b5b', 0.8), false));
            blk('impressora', 0.22, 0.14, 0.26, 1.5, F + 0.07, 0.4, whiteMat);
            const lampBase = ctx.cyl('luminaria', 0.015, 0.18, -1.4, F + 0.56, -0.38, metalMat, false, 6);
            const bulb = addMesh(parent, new THREE.SphereGeometry(0.04, 8, 6), lightMat(0xfff1c0), -1.4, F + 0.68, -0.38, false);

            const actor = makeActor(ctx, o.n, -0.95, F, 0, -Math.PI / 2);
            const s = actor.s;
            const cycle = 24;
            const kbd = V(-1.28, F + 0.52, 0);
            const kl = V(0, 0, 0);
            const mouseW = V(-1.26, F + 0.52, -0.2);
            const mouseL = V(0, 0, 0);
            const mugW = V(-1.3, F + 0.56, 0.26);
            const mugL = V(0, 0, 0);
            const upW = V(0, 0, 0);
            addTicker((time) => {
              const u = (time + o.phase) % cycle;
              const wMouse = win(7, 7.5, 9.5, 10, u);
              const wSip = win(11, 11.6, 14.4, 15, u);
              const lift = win(12.2, 12.9, 13.6, 14.3, u);
              const wStretch = win(18, 18.8, 20, 20.8, u);
              const wType = Math.max(0, 1 - wMouse - wSip - wStretch);
              sitPose(s, 0.68, 0.5);
              s.lean = 0.1 * (wType + wMouse) - 0.12 * wStretch;
              actor.toLocal(kbd.x, kbd.y + 0.025, kbd.z - 0.06, kl);
              s.hands[1].set(kl.x, kl.y, kl.z);
              s.hands[0].copy(kl);
              s.hands[0].z -= 0.12;
              s.hands[1].z += 0.12;
              s.hands[0].z += 0.0;
              s.hands[0].add(V(Math.sin(time * 13) * 0.02, Math.abs(Math.sin(time * 17)) * 0.012, Math.sin(time * 9) * 0.02));
              s.hands[1].add(V(Math.sin(time * 11 + 1) * 0.02, Math.abs(Math.sin(time * 15)) * 0.012, Math.sin(time * 8) * 0.02));
              actor.toLocal(mouseW.x, mouseW.y + 0.02, mouseW.z, mouseL);
              s.hands[0].lerp(mouseL.add(V(Math.sin(time * 2) * 0.03, 0, Math.cos(time * 2.7) * 0.03)), wMouse);
              actor.toLocal(mugW.x, mugW.y + 0.03, mugW.z, mugL);
              s.hands[0].lerp(mugL, wSip);
              s.hands[1].lerp(V(0.22, 1.5, 0.15), wStretch);
              s.hands[0].lerp(V(-0.22, 1.5, 0.15), wStretch);
              s.hands[0].y += 0.18 * wSip * (1 - wSip);
              s.mugVisible = true;
              s.mugPos = (u > 12.1 && u < 14.4) ? null : null;
              s.mugHand = 0;
              s.sip = lift;
              s.level = 0.7 - 0.2 * ss(13, 14, u);
              s.headX = 0.18 * wType + 0.05 * wMouse - 0.1 * wStretch + Math.sin(time * 0.8) * 0.03;
              s.headY = Math.sin(time * 0.3) * 0.05;
              s.smile = 0.7 * wStretch;
              mugBody.visible = !(u > 12.1 && u < 14.4);
              actor.apply(time);
              if (u > 12.1 && u < 14.4) s.mugVisible = true;
              if (!(u > 12.1 && u < 14.4) && u > 11) {
                actor.person.mug.visible = false;
                mugBody.visible = true;
              } else if (u <= 11 || u >= 15) {
                actor.person.mug.visible = false;
                mugBody.visible = true;
              }
              screen.seed = o.seed + time * 0.0;
            });
          };

          indoor.laundry = (ctx, o) => {
            const { F, blk, parent } = ctx;
            blk('maquina', 0.42, 0.55, 0.42, -1.45, F + 0.275, -1.1, whiteMat);
            const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16), stdMat('#5b8fc0', 0.4));
            drum.rotation.z = Math.PI / 2;
            drum.position.set(-1.235, F + 0.3, -1.1);
            parent.add(drum);
            const clothes = addMesh(parent, box(0.012, 0.09, 0.05), stdMat('#d9783a', 0.8), -1.226, F + 0.3, -1.1, false);
            const clothes2 = addMesh(parent, box(0.012, 0.05, 0.08), stdMat('#f4f7f5', 0.8), -1.226, F + 0.3, -1.1, false);
            blk('tabua-tampo', 0.34, 0.025, 1.0, -0.4, F + 0.46, 0.1, stdMat('#8fb4c8', 0.6));
            [-0.35, 0.35].forEach(z => {
              const leg = blk('tabua-perna', 0.02, 0.45, 0.02, -0.4, F + 0.225, 0.1 + z, metalMat, false);
              leg.rotation.x = z > 0 ? 0.25 : -0.25;
            });
            [-0.37, 0.37].forEach(dz => ctx.obs('tabua-perna', -0.4, F + 0.225, 0.1 + dz, 0.06, 0.45, 0.06));
            blk('cesto', 0.3, 0.28, 0.3, 1.3, F + 0.14, -1.1, stdMat('#c9b89a', 0.8));
            addMesh(parent, box(0.26, 0.04, 0.26), stdMat('#d9783a', 0.8), 1.3, F + 0.3, -1.1, false);
            const iron = new THREE.Group();
            addMesh(iron, box(0.07, 0.035, 0.14), stdMat('#aab4bc', 0.3), 0, 0, 0);
            addMesh(iron, box(0.05, 0.03, 0.06), darkMat, 0, 0.03, -0.02);
            parent.add(iron);
            const steam = [0, 1, 2].map(() => {
              const puff = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 5), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.3, depthWrite: false }));
              parent.add(puff);
              return puff;
            });
            addMesh(parent, box(0.02, 0.06, 0.05), whiteMat, -1.675, F + 0.3, 0.9, false);
            const cable = makeCable(parent, '#2b323a');
            const outletW = V(-1.66, F + 0.3, 0.9);
            const lampMat = lightMat(0xffe9a8);
            addMesh(parent, new THREE.SphereGeometry(0.03, 6, 6), lampMat, -0.4, F + 0.5, 0.62, false);

            const actor = makeActor(ctx, o.n, -0.02, F, 0.1, -Math.PI / 2);
            const s = actor.s;
            const cycle = 20;
            const board = V(0, 0, 0);
            const bl = V(0, 0, 0);
            const ironPos = V(0, 0, 0);
            addTicker((time) => {
              const u = (time + o.phase) % cycle;
              drum.rotation.x = time * 6;
              clothes.position.y = F + 0.3 + Math.sin(time * 6) * 0.05;
              clothes.position.z = -1.1 + Math.cos(time * 6) * 0.05;
              clothes2.position.y = F + 0.3 + Math.sin(time * 6 + 2) * 0.05;
              clothes2.position.z = -1.1 + Math.cos(time * 6 + 2) * 0.05;
              standPose(s, 0.88);
              s.lean = 0.2;
              const pass = Math.sin(time * 1.6);
              actor.root.position.z = 0.1 + pass * 0.12;
              actor.root.position.x = 0.05;
              ironPos.set(-0.4, F + 0.49, 0.1 + pass * 0.14);
              actor.toLocal(ironPos.x, ironPos.y + 0.03, ironPos.z, bl);
              s.hands[0].copy(bl);
              actor.toLocal(-0.42, F + 0.5, 0.1 + pass * 0.14 - 0.3, board);
              s.hands[1].copy(board);
              s.hands[1].x += 0.1;
              s.headX = 0.35;
              s.headY = Math.sin(time * 0.5) * 0.1;
              const rest = win(15, 15.6, 17.4, 18, u);
              s.hands[1].lerp(V(0.22, 1.3, 0.2), rest);
              s.sip = 0;
              s.smile = 0.3 * rest;
              s.headX -= 0.2 * rest;
              actor.apply(time);
              iron.position.copy(ironPos);
              iron.rotation.y = Math.PI / 2;
              const outletTop = V(ironPos.x, ironPos.y + 0.05, ironPos.z);
              cable.update(outletW, V(ironPos.x + 0.02, ironPos.y + 0.03, ironPos.z - 0.06), 0.1);
              steam.forEach((puff, i) => {
                const q = (time * 0.7 + i / 3) % 1;
                puff.position.set(ironPos.x, ironPos.y + 0.05 + q * 0.18, ironPos.z + 0.05);
                puff.scale.setScalar(0.015 + q * 0.03);
                puff.material.opacity = (1 - q) * 0.3;
              });
            });
          };

          indoor.bed = (ctx, o) => {
            const { F, blk, parent } = ctx;
            blk('cama-base', 1.05, 0.14, 1.25, 0.55, F + 0.07, -0.85, woodMat);
            blk('colchao', 1.0, 0.14, 1.2, 0.55, F + 0.21, -0.85, stdMat('#e8ecef', 0.8));
            blk('cabeceira', 1.05, 0.5, 0.08, 0.55, F + 0.3, -1.44, woodMat);
            blk('travesseiro', 0.4, 0.06, 0.22, 0.55, F + 0.31, -1.3, stdMat('#ffffff', 0.9), false);
            addMesh(parent, box(1.0, 0.03, 0.6), stdMat('#5b8fc0', 0.9), 0.55, F + 0.295, -0.55, false);
            blk('criado-mudo', 0.28, 0.28, 0.28, -0.25, F + 0.14, -1.3, woodMat);
            ctx.cyl('abajur-base', 0.04, 0.04, -0.25, F + 0.3, -1.3, metalMat, false, 8);
            const shade = addMesh(parent, new THREE.CylinderGeometry(0.07, 0.1, 0.12, 10), lightMat(0xffe9a8), -0.25, F + 0.38, -1.3, false);
            ctx.obs('abajur', -0.25, F + 0.4, -1.3, 0.2, 0.2, 0.2);
            addMesh(parent, box(0.02, 0.06, 0.05), whiteMat, -0.4, F + 0.3, -1.475, false);
            blk('guarda-roupa', 0.5, 1.4, 0.6, -1.4, F + 0.7, -1.1, woodMat);
            const tablet = new THREE.Group();
            addMesh(tablet, box(0.1, 0.007, 0.14), darkMat, 0, 0, 0);
            const tabScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.125), lightMat(0x9fd0e8, 0x10161c));
            tabScreen.rotation.x = -Math.PI / 2;
            tabScreen.position.y = 0.0045;
            tablet.add(tabScreen);
            parent.add(tablet);
            const cable = makeCable(parent, '#e8ecef');
            const outletW = V(-0.4, F + 0.3, -1.45);

            const actor = makeActor(ctx, o.n, 0.55, F + 0.28, -0.82, 0);
            const s = actor.s;
            const cycle = 24;
            addTicker((time) => {
              const u = (time + o.phase) % cycle;
              standPose(s, 0.16);
              s.lean = -0.1;
              s.feet[0].set(-0.1, 0, 0.82);
              s.feet[1].set(0.1, 0, 0.82);
              s.hip.set(0, 0.16, 0);
              const scroll = Math.sin(time * 2.5) * 0.015;
              s.hands[0].set(-0.1, 0.5 + scroll, 0.42);
              s.hands[1].set(0.1, 0.5, 0.4);
              const laugh = win(8, 8.4, 10, 10.4, u);
              const stretch = win(15, 15.8, 17, 17.8, u);
              s.hands[0].lerp(V(-0.2, 1.55, 0.05), stretch);
              s.hands[1].lerp(V(0.2, 1.55, 0.05), stretch);
              s.headX = 0.3 * (1 - stretch) + Math.sin(time * 0.7) * 0.03;
              s.headZ = 0.06 * Math.sin(time * 0.4);
              s.lean = -0.1 + 0.03 * Math.sin(time * 30) * laugh;
              s.smile = 0.9 * laugh;
              s.talk = 0.4 * laugh * (0.5 + 0.5 * Math.sin(time * 14));
              actor.apply(time);
              const hl = actor.person.hands[0];
              const hr = actor.person.hands[1];
              const mid = V((hl.x + hr.x) / 2, (hl.y + hr.y) / 2 + 0.03, (hl.z + hr.z) / 2 + 0.03);
              actor.toWorld(mid, tablet.position);
              tablet.rotation.set(-0.7 * (1 - stretch) , actor.root.rotation.y, 0);
              cable.update(outletW, V(tablet.position.x - 0.04, tablet.position.y - 0.01, tablet.position.z - 0.06), 0.18);
              tabScreen.material.color.setHex(Math.floor(time * 0.6) % 2 ? 0x9fd0e8 : 0xf3d58a);
            });
          };

          indoor.vacuum = (ctx, o) => {
            const { F, blk, parent } = ctx;
            ctx.blk('tapete', 1.5, 0.012, 2.0, 0.1, F + 0.006, 0, stdMat('#8a6b5a', 0.95), false);
            blk('sofa', 0.4, 0.28, 1.0, 1.45, F + 0.14, -0.2, fabricMats[1]);
            blk('planta-vaso', 0.18, 0.18, 0.18, -1.5, F + 0.09, 1.2, stdMat('#c0504a', 0.6));
            const leaves = addMesh(parent, new THREE.SphereGeometry(0.2, 8, 6), stdMat('#4f8f5b', 0.8), -1.5, F + 0.35, 1.2, false);
            ctx.obs('planta', -1.5, F + 0.4, 1.2, 0.3, 0.4, 0.3);
            blk('aparador', 0.3, 0.45, 0.8, -1.5, F + 0.225, -0.5, woodMat);
            addMesh(parent, box(0.02, 0.06, 0.05), whiteMat, 0.9, F + 0.3, -1.475, false);
            const body = new THREE.Group();
            addMesh(body, new THREE.CylinderGeometry(0.075, 0.075, 0.2, 10), stdMat('#d9783a', 0.5), 0, 0.075, 0).rotation.z = Math.PI / 2;
            addMesh(body, new THREE.CylinderGeometry(0.03, 0.03, 0.04, 8), darkMat, 0, 0.075, 0.1);
            parent.add(body);
            const head = new THREE.Group();
            addMesh(head, box(0.22, 0.03, 0.08), darkMat, 0, 0.015, 0);
            parent.add(head);
            const wand = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1, 6), metalMat);
            parent.add(wand);
            const hose = makeCable(parent, '#5a6772', 0.014, 8);
            const cable = makeCable(parent, '#2b323a', 0.01, 12);
            const outletW = V(0.9, F + 0.3, -1.46);

            const actor = makeActor(ctx, o.n, 0.1, F, -0.8, 0);
            const s = actor.s;
            const up = V(0, 1, 0);
            const dir = V(0, 0, 0);
            const path = makePath([[0.1, -0.85], [0.1, 0.8]], 'pingpong');
            const pa = V(0, 0, 0);
            const pb = V(0, 0, 0);
            const gripA = V(0, 0, 0);
            const gripB = V(0, 0, 0);
            const tmpV = V(0, 0, 0);
            addTicker((time) => {
              const dist = time * 0.22;
              const smp = samplePath(path, dist);
              actor.root.position.set(smp.x, F, smp.z);
              const yawTo = smp.heading;
              actor.root.rotation.y = yawTo;
              const legPhase = gait(s, (dist / SC) * 1.0, 1);
              const strokeNow = Math.sin(time * 2.4);
              standPose(s, 0.86);
              gait(s, (dist / SC), 1, 0.86);
              s.lean = 0.14;
              const sinY = Math.sin(yawTo);
              const cosY = Math.cos(yawTo);
              const fwd = V(sinY, 0, cosY);
              const sideV = V(cosY, 0, -sinY);
              const reach = 0.55 + strokeNow * 0.16;
              const headW = V(actor.root.position.x + fwd.x * (0.34 + strokeNow * 0.1) * 1.0 + fwd.x * 0.5, F + 0.02, actor.root.position.z + fwd.z * (0.34 + strokeNow * 0.1) + fwd.z * 0.5);
              const gripW = V(actor.root.position.x + fwd.x * 0.2 + sideV.x * 0.05, F + 0.5, actor.root.position.z + fwd.z * 0.2 + sideV.z * 0.05);
              actor.toLocal(gripW.x, gripW.y, gripW.z, gripA);
              s.hands[0].copy(gripA);
              s.hands[0].x -= 0.05;
              s.hands[1].copy(gripA);
              s.hands[1].x += 0.12;
              s.hands[1].y -= 0.04;
              s.headX = 0.2;
              s.headY = Math.sin(time * 0.4) * 0.1;
              s.smile = 0.2;
              actor.apply(time);
              head.position.set(headW.x, F, headW.z);
              head.rotation.y = yawTo;
              dir.subVectors(V(gripW.x, gripW.y, gripW.z), V(headW.x, F + 0.03, headW.z));
              const len = dir.length();
              wand.position.set((gripW.x + headW.x) / 2, (gripW.y + F + 0.03) / 2, (gripW.z + headW.z) / 2);
              wand.scale.set(1, len, 1);
              wand.quaternion.setFromUnitVectors(up, dir.normalize());
              body.position.set(actor.root.position.x - fwd.x * 0.45, F, actor.root.position.z - fwd.z * 0.45);
              body.rotation.y = yawTo + Math.PI / 2;
              hose.update(V(gripW.x, gripW.y + 0.02, gripW.z), V(body.position.x, F + 0.09, body.position.z), 0.08);
              cable.update(outletW, V(body.position.x, F + 0.06, body.position.z - fwd.z * 0.1), 0.35);
            });
          };

          indoor.fan = (ctx, o) => {
            const { F, blk, parent } = ctx;
            ctx.blk('tapete', 1.3, 0.01, 1.3, 0.0, F + 0.005, 0, rugMat, false);
            blk('pedestal-base', 0.2, 0.03, 0.2, -1.0, F + 0.015, 0, darkMat);
            ctx.cyl('pedestal-haste', 0.015, 0.8, -1.0, F + 0.43, 0, metalMat, false, 6);
            ctx.obs('pedestal-haste', -1.0, F + 0.43, 0, 0.1, 0.8, 0.1);
            const fanHead = new THREE.Group();
            fanHead.position.set(-1.0, F + 0.85, 0);
            parent.add(fanHead);
            const cage = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.008, 6, 20), metalMat);
            cage.rotation.y = Math.PI / 2;
            fanHead.add(cage);
            addMesh(fanHead, new THREE.CylinderGeometry(0.04, 0.04, 0.08, 8), darkMat, -0.05, 0, 0).rotation.z = Math.PI / 2;
            const blades = new THREE.Group();
            blades.position.x = 0.01;
            fanHead.add(blades);
            for (let i = 0; i < 3; i++) {
              const blade = addMesh(blades, box(0.01, 0.12, 0.05), stdMat('#7fb4d6', 0.4), 0, 0.06, 0, false);
              blade.rotation.x = (i * Math.PI * 2) / 3;
              blade.position.set(0, Math.cos((i * Math.PI * 2) / 3) * 0.06, Math.sin((i * Math.PI * 2) / 3) * 0.06 * -1);
            }
            ctx.obs('ventilador', -1.0, F + 0.85, 0, 0.3, 0.3, 0.3);
            const wind = [0, 1, 2, 3].map(i => {
              const streak = new THREE.Mesh(box(0.1, 0.005, 0.01), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.4, depthWrite: false }));
              parent.add(streak);
              return streak;
            });
            blk('cadeira-assento', 0.3, 0.03, 0.3, 0.45, F + 0.26, 0, woodMat);
            blk('cadeira-encosto', 0.04, 0.32, 0.3, 0.6, F + 0.44, 0, woodMat);
            ctx.cyl('cadeira-pernas', 0.1, 0.24, 0.45, F + 0.12, 0, woodMat, false, 6);
            blk('mesinha', 0.25, 0.3, 0.3, 0.1, F + 0.15, 0.7, woodMat);
            blk('cama-cachorro', 0.4, 0.06, 0.4, 1.2, F + 0.03, 0.9, fabricMats[0], false);
            addMesh(parent, box(0.02, 0.06, 0.05), whiteMat, -1.675, F + 0.3, -0.4, false);
            const cable = makeCable(parent, '#2b323a', 0.01, 10);
            const glass = addMesh(parent, new THREE.CylinderGeometry(0.03, 0.025, 0.08, 10), new THREE.MeshStandardMaterial({ color: '#f0a050', roughness: 0.2, transparent: true, opacity: 0.8 }), 0, 0, 0, false);

            const actor = makeActor(ctx, o.n, 0.46, F, 0, -Math.PI / 2);
            const s = actor.s;
            const cycle = 22;
            const glassRest = V(0.1, F + 0.34, 0.7);
            const gl = V(0, 0, 0);
            addTicker((time) => {
              const u = (time + o.phase) % cycle;
              fanHead.rotation.y = Math.sin(time * 0.5) * 0.5;
              blades.rotation.x = time * 25;
              sitPose(s, 0.58, 0.5);
              s.lean = -0.05;
              const sip = win(5, 5.8, 7.4, 8.2, u) + win(14, 14.8, 16.4, 17.2, u);
              actor.toLocal(glassRest.x, glassRest.y + 0.02, glassRest.z, gl);
              const reach = win(4.2, 5, 8.2, 9) + win(13.2, 14, 17.2, 18);
              s.hands[0].lerp(gl, Math.min(1, reach));
              s.sip = Math.min(1, sip);
              s.mugHand = 0;
              const tug = win(10, 10.6, 12, 12.6, u);
              s.hands[1].lerp(V(0.08, 1.15, 0.12), tug);
              s.headX = -0.1 * tug + 0.05 * Math.sin(time * 0.7);
              s.headZ = 0.05 * Math.sin(time * 0.3);
              s.smile = 0.6 * tug + 0.3;
              actor.apply(time);
              wind.forEach((w, i) => {
                const q = (time * 0.8 + i / 4) % 1;
                w.position.set(-0.85 + q * 1.1, F + 0.82 + (i - 1.5) * 0.06, (i - 1.5) * 0.05 + Math.sin(fanHead.rotation.y) * q * 0.5);
                w.material.opacity = (1 - q) * 0.4;
              });
              glass.visible = true;
              if (sip > 0.3 && reach > 0.5) {
                const hand = actor.person.hands[0];
                actor.toWorld(V(hand.x, hand.y, hand.z + 0.03), glass.position);
              } else {
                glass.position.set(glassRest.x, glassRest.y, glassRest.z);
              }
              cable.update(V(-1.675, F + 0.3, -0.4), V(-1.0, F + 0.04, -0.1), 0.05);
            });
          };
