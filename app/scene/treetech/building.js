        // 12. TREETECH: SEGUNDA EMPRESA, COM O PC DO RABBITMQ DENTRO
        const TREETECH_POS = { x: 54, z: 9.5 };
        const treetechWorld = new THREE.Group();
        treetechWorld.position.set(TREETECH_POS.x, 0.3, TREETECH_POS.z);
        scene.add(treetechWorld);

        const buildTreetech = () => {
          const labelTexture = (width, height, draw) => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            draw(canvas.getContext('2d'), width, height);
            const tex = new THREE.CanvasTexture(canvas);
            tex.anisotropy = 4;
            return tex;
          };

          const nameGreen = '#2f9e5e';

          // Placa com o nome em verde e uma pequena árvore
          const signTexture = labelTexture(1024, 256, (ctx, w, h) => {
            ctx.fillStyle = '#f4f7f5';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = nameGreen;
            ctx.lineWidth = 14;
            ctx.strokeRect(7, 7, w - 14, h - 14);

            ctx.fillStyle = nameGreen;
            ctx.beginPath();
            ctx.moveTo(150, 40);
            ctx.lineTo(105, 120);
            ctx.lineTo(195, 120);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(150, 80);
            ctx.lineTo(95, 175);
            ctx.lineTo(205, 175);
            ctx.fill();
            ctx.fillRect(140, 175, 20, 34);

            ctx.font = 'bold 150px Arial, sans-serif';
            ctx.textBaseline = 'middle';
            ctx.fillText('Treetech', 250, h / 2 + 6);
          });

          // Tela do servidor e etiqueta da torre
          let screenTexture;
          screenTexture = labelTexture(512, 320, (ctx, w, h) => {
            ctx.fillStyle = '#1f2933';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#d9783a';
            ctx.fillRect(0, 0, w, 56);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 36px Arial, sans-serif';
            ctx.textBaseline = 'middle';
            ctx.fillText('Management', 20, 30);
            ctx.font = 'bold 76px Arial, sans-serif';
            ctx.fillText('RabbitMQ', 30, 150);
            ctx.fillStyle = '#9aa7b2';
            ctx.font = '30px Arial, sans-serif';
            ctx.fillText('broker  porta 5672', 30, 220);
            ctx.fillStyle = '#6fbf8a';
            ctx.fillText('● online', 30, 270);
          });
          failureSim.mqTexture = screenTexture;

          const towerLabelTexture = labelTexture(256, 96, (ctx, w, h) => {
            ctx.fillStyle = '#e8ecef';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#d9783a';
            ctx.fillRect(0, 0, 14, h);
            ctx.fillStyle = '#2b323a';
            ctx.font = 'bold 44px Arial, sans-serif';
            ctx.textBaseline = 'middle';
            ctx.fillText('RabbitMQ', 30, h / 2 + 2);
          });

          const mat = (color, roughness = 0.6) => new THREE.MeshStandardMaterial({ color, roughness });
          const wallMat = mat('#dfe3e6');
          const glassMat = mat('#7f98aa', 0.3);
          duskWindowMats.push(glassMat);
          const darkMat = mat('#3a4048', 0.5);
          const addMesh = (parent, geo, material, x, y, z) => {
            const mesh = new THREE.Mesh(geo, material);
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            parent.add(mesh);
            return mesh;
          };
          const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

          // Terreno: grama, base de concreto e meio-fio verde
          addMesh(treetechWorld, box(16, 0.6, 16), mat('#c9ccce', 0.8), 0, -0.3, 0).castShadow = false;
          addMesh(treetechWorld, box(16.6, 0.1, 16.6), mat('#7aa58a', 0.8), 0, -0.06, 0).castShadow = false;

          // Prédio de 3 andares (térreo, desenvolvimento, Sigma ECM); as paredes baixam e os andares se afastam quando o telhado abre
          const building = new THREE.Group();
          treetechWorld.add(building);

          const bz = -1.5;
          const bw = 10;
          const bd = 6;
          const wallH = 3.4;
          const thick = 0.25;
          const FLOOR_PITCH = 3.6;
          const EXPLODE_GAP = 3;
          const southFace = bz + bd / 2 + 0.02;

          const floors = [0, 1, 2, 3].map(level => {
            const group = new THREE.Group();
            group.position.y = level * FLOOR_PITCH;
            building.add(group);

            if (level === 0) addMesh(group, box(bw, 0.1, bd), mat('#d8d6d0', 0.8), 0, 0.05, bz).castShadow = false;
            else addMesh(group, box(bw + 0.2, 0.3, bd + 0.2), mat('#7aa58a', 0.8), 0, -0.05, bz);

            const walls = new THREE.Group();
            walls.position.y = 0.1;
            addMesh(walls, box(bw, wallH, thick), wallMat, 0, wallH / 2, bz - bd / 2 + thick / 2);
            addMesh(walls, box(bw, wallH, thick), wallMat, 0, wallH / 2, bz + bd / 2 - thick / 2);
            addMesh(walls, box(thick, wallH, bd - thick * 2), wallMat, -bw / 2 + thick / 2, wallH / 2, bz);
            addMesh(walls, box(thick, wallH, bd - thick * 2), wallMat, bw / 2 - thick / 2, wallH / 2, bz);

            const windowsX = level === 0 ? [-3.8, -2.3, 2.3, 3.8] : [-3.8, -1.9, 0, 1.9, 3.8];
            windowsX.forEach(wx => {
              addMesh(walls, box(1.2, 1.3, 0.04), glassMat, wx, 1.8, southFace).castShadow = false;
            });
            if (level === 0) addMesh(walls, box(1.4, 2.3, 0.06), darkMat, 0, 1.15, southFace + 0.01).castShadow = false;
            [bz - 1.2, bz + 1.2].forEach(wz => {
              addMesh(walls, box(0.04, 1.3, 1.2), glassMat, bw / 2 + 0.02, 1.8, wz).castShadow = false;
            });
            group.add(walls);

            const furniture = new THREE.Group();
            furniture.position.y = 0.1;
            group.add(furniture);
            return { group, walls, furniture };
          });

          // Telhado no topo do 4º andar
          const roof = new THREE.Group();
          addMesh(roof, box(bw + 0.4, 0.25, bd + 0.4), mat('#6b7d73'), 0, 0.1 + wallH + 0.125, bz);
          addMesh(roof, box(1.2, 0.5, 0.9), mat('#9aa3a0'), -3, 0.1 + wallH + 0.5, bz + 0.5);
          floors[3].group.add(roof);

          // Iluminação interna: luminárias no teto de cada andar e uma luz de ponto por andar, acesas no Fim de Tarde
          const ceilingMat = new THREE.MeshStandardMaterial({ color: '#f4f1e6', emissive: '#fff0c8', emissiveIntensity: 0 });
          duskLightMats.push({ mat: ceilingMat, day: 0, dusk: 1.6 });
          [[floors[1].group, -0.23], [floors[2].group, -0.23], [floors[3].group, -0.23], [roof, 0.1 + wallH - 0.03]].forEach(([ceiling, y]) => {
            [-3, 0, 3].forEach(lx => [bz - 1.3, bz + 1.3].forEach(lz => {
              addMesh(ceiling, box(1.6, 0.05, 0.5), ceilingMat, lx, y, lz).castShadow = false;
            }));
          });
          floors.forEach(floor => {
            const light = new THREE.PointLight(0xffdca0, 0, 10, 2);
            light.position.set(0, 2.7, bz);
            floor.group.add(light);
            duskInteriorLights.push({ light, max: 2.2 });
          });

          // Térreo: mesa com monitor, teclado, cadeira e a torre do servidor RabbitMQ
          const furniture = floors[0].furniture;

          const deskMat = mat('#a8896a', 0.7);
          const chairMat = mat('#4a5360');
          addMesh(furniture, box(1.6, 0.06, 0.8), deskMat, 0, 0.75, -3.7);
          addMesh(furniture, box(0.05, 0.72, 0.7), deskMat, -0.75, 0.36, -3.7);
          addMesh(furniture, box(0.05, 0.72, 0.7), deskMat, 0.75, 0.36, -3.7);

          addMesh(furniture, box(0.7, 0.45, 0.04), darkMat, 0, 1.05, -3.85);
          addMesh(furniture, box(0.06, 0.2, 0.06), darkMat, 0, 0.88, -3.85);
          const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.4), new THREE.MeshBasicMaterial({ map: screenTexture }));
          screen.position.set(0, 1.05, -3.82);
          furniture.add(screen);
          addMesh(furniture, box(0.45, 0.02, 0.15), darkMat, 0, 0.79, -3.42);

          addMesh(furniture, box(0.5, 1.0, 0.7), darkMat, 1.7, 0.5, -3.7);
          const towerLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.16), new THREE.MeshBasicMaterial({ map: towerLabelTexture }));
          towerLabel.position.set(1.7, 0.72, -3.34);
          furniture.add(towerLabel);
          const towerLed = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), new THREE.MeshBasicMaterial({ color: '#6fbf8a' }));
          towerLed.position.set(1.7, 0.92, -3.34);
          furniture.add(towerLed);
          treetechLed.mesh = towerLed;

          // Recepção do térreo: balcão, sofá e plantas
          const greenMat = mat('#7aa58a', 0.8);
          addMesh(furniture, box(2.4, 1.0, 0.5), greenMat, -3.0, 0.5, -0.4);
          addMesh(furniture, box(2.5, 0.06, 0.6), mat('#d8d6d0', 0.6), -3.0, 1.03, -0.4);
          addMesh(furniture, box(2.0, 0.4, 0.8), chairMat, 3.4, 0.25, 0.5);
          addMesh(furniture, box(2.0, 0.5, 0.15), chairMat, 3.4, 0.65, 0.1);
          [[4.4, 1.0], [-4.4, 1.0]].forEach(([px, pz]) => {
            addMesh(furniture, new THREE.CylinderGeometry(0.2, 0.16, 0.4, 10), mat('#c0504a', 0.6), px, 0.2, pz);
            addMesh(furniture, new THREE.SphereGeometry(0.34, 8, 6), mat('#4f8f5b', 0.7), px, 0.7, pz);
          });

          // Andares: térreo com o servidor, 1º com os devs e 2º com o painel do Sigma (deslocado 6 para o painel ficar no lado oeste)
          floors[2].furniture.position.x = 6;
          buildOfficeLife({ ground: furniture, dev: floors[1].furniture, sigma: floors[2].furniture });

          // Sala de reunião no 4º andar: o cliente pede os módulos, o Sigma e a instalação e fecha o negócio com um aperto de mão
          const buildMeetingRoom = () => {
            const { createPerson, makeState, V, ss, win, canvasOf } = lifeKit;
            const room = new THREE.Group();
            room.position.y = 0.1;
            room.position.x = -2.2;
            floors[3].group.add(room);

            const table = { x: 2.2, z: bz - 0.4 };
            const woodMat = mat('#a8896a', 0.7);
            addMesh(room, box(2.0, 0.06, 1.0), woodMat, table.x, 0.8, table.z);
            [[-0.85, -0.4], [0.85, -0.4], [-0.85, 0.4], [0.85, 0.4]].forEach(([lx, lz]) => {
              addMesh(room, box(0.05, 0.78, 0.05), woodMat, table.x + lx, 0.39, table.z + lz);
            });
            addMesh(room, box(0.3, 0.01, 0.22), mat('#f4f7f5', 0.6), table.x, 0.835, table.z, false);

            [[-0.5, -0.9, 1], [0.5, -0.9, 1], [-0.5, 0.9, -1], [0.5, 0.9, -1]].forEach(([lx, lz, side]) => {
              addMesh(room, box(0.5, 0.06, 0.5), chairMat, table.x + lx, 0.45, table.z + lz);
              addMesh(room, box(0.5, 0.55, 0.06), chairMat, table.x + lx, 0.75, table.z + lz - side * 0.25);
              addMesh(room, new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), chairMat, table.x + lx, 0.22, table.z + lz);
            });

            // TV da parede norte: o que o cliente pede, item por item, e o negócio fechado
            const tvCanvas = canvasOf(640, 360);
            const tvCtx = tvCanvas.getContext('2d');
            const tvTexture = new THREE.CanvasTexture(tvCanvas);
            tvTexture.anisotropy = 4;
            const items = ['Módulos TM, BM, GMP e DM', 'Sigma ECM (o site de monitoramento)', 'Instalação no Trafo 01'];
            const paintDeal = (checked, closed) => {
              tvCtx.fillStyle = '#10151a';
              tvCtx.fillRect(0, 0, 640, 360);
              tvCtx.fillStyle = nameGreen;
              tvCtx.fillRect(0, 0, 640, 56);
              tvCtx.fillStyle = '#ffffff';
              tvCtx.font = 'bold 30px Arial, sans-serif';
              tvCtx.textBaseline = 'middle';
              tvCtx.fillText('Proposta Treetech · cliente', 24, 30);
              items.forEach((text, i) => {
                const y = 112 + i * 62;
                const on = i < checked;
                tvCtx.strokeStyle = on ? '#6fdf8a' : '#5a6672';
                tvCtx.lineWidth = 4;
                tvCtx.strokeRect(28, y - 18, 36, 36);
                if (on) {
                  tvCtx.fillStyle = '#6fdf8a';
                  tvCtx.font = 'bold 36px Arial, sans-serif';
                  tvCtx.fillText('✓', 32, y + 2);
                }
                tvCtx.fillStyle = on ? '#e8ecef' : '#7c8a96';
                tvCtx.font = '28px Arial, sans-serif';
                tvCtx.fillText(text, 84, y);
              });
              tvCtx.fillStyle = closed ? '#2d6a4f' : '#232b33';
              tvCtx.fillRect(0, 304, 640, 56);
              tvCtx.fillStyle = closed ? '#ffffff' : '#7c8a96';
              tvCtx.font = 'bold 30px Arial, sans-serif';
              tvCtx.fillText(closed ? 'NEGÓCIO FECHADO ✓' : 'Em negociação…', 24, 333);
              tvTexture.needsUpdate = true;
            };
            paintDeal(0, false);
            addMesh(room, box(2.3, 1.3, 0.06), mat('#1a2026', 0.5), 2.9, 1.9, -4.22, false);
            const tv = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.24), new THREE.MeshBasicMaterial({ map: tvTexture }));
            tv.position.set(2.9, 1.9, -4.185);
            room.add(tv);

            const base = { skin: '#f1c7a1', shirt: '#2f9e5e', pants: '#2f3b52', hair: '#4a3426', hairStyle: 'short', top: 'shirt', sleeves: 'long', shoe: '#e8ecef', mugColor: '#e8ecef' };
            const makeMeetPerson = (look, x, z, yaw) => {
              const person = createPerson({ ...base, ...look });
              person.root.position.set(x, 0, z);
              person.root.rotation.y = yaw;
              room.add(person.root);
              const s = makeState();
              s.mugVisible = false;
              return { person, s, root: person.root };
            };
            const seller = makeMeetPerson({ hair: '#7a4a2a', hairStyle: 'long', blinkSeed: 0.5 }, table.x - 0.5, table.z - 0.9, 0);
            const buyer = makeMeetPerson({ shirt: '#3a5a8c', skin: '#b07850', hair: '#1f1a17', glasses: true, blinkSeed: 1.3 }, table.x + 0.5, table.z + 0.9, Math.PI);
            const closerA = makeMeetPerson({ hairStyle: 'fade', hair: '#1d1612', logo: true, blinkSeed: 2.1 }, 3.65, -1.9, Math.PI / 2);
            const closerB = makeMeetPerson({ shirt: '#3a5a8c', skin: '#e0ac86', hair: '#2b2118', hairStyle: 'cap', blinkSeed: 2.9 }, 4.55, -1.66, -Math.PI / 2);

            const toLocal = (m, wx, wy, wz, out) => {
              const dx = wx - m.root.position.x;
              const dz = wz - m.root.position.z;
              const c = Math.cos(m.root.rotation.y);
              const sn = Math.sin(m.root.rotation.y);
              return out.set(dx * c - dz * sn, wy, dx * sn + dz * c);
            };
            const grip = V(4.1, 1.05, -1.78);
            const handTarget = V(0, 0, 0);
            const CYCLE = 30;
            let lastKey = '';

            const sitTalk = (m, time, speaking, look, glance) => {
              const s = m.s;
              const g = speaking ? 0.5 + 0.5 * Math.sin(time * 3) : 0;
              s.time = time;
              s.hip.set(0, 0.64, 0);
              s.lean = 0.05;
              s.feet[0].set(-0.12, 0, 0.5);
              s.feet[1].set(0.12, 0, 0.5);
              s.hands[0].set(-0.15 - 0.08 * g, 0.88 + 0.2 * g, 0.5 + 0.08 * g);
              s.hands[1].set(0.15, 0.88, 0.5);
              s.headX = 0.05 + 0.04 * Math.sin(time * 0.9);
              s.headY = look * glance + (speaking ? 0 : 0.12 * Math.sin(time * 0.5));
              s.talk = speaking ? 0.5 * (0.5 + 0.5 * Math.sin(time * 12 + glance)) : 0;
              s.smile = 0.2 + 0.6 * Math.max(0, look);
              m.person.apply(s);
            };

            const standTalk = (m, other, time, speaking, reach, shake, facing) => {
              const s = m.s;
              const g = speaking ? 0.5 + 0.5 * Math.sin(time * 3.2) : 0;
              s.time = time;
              s.hip.set(0, 0.88, 0.1 * reach);
              s.lean = 0.03 + 0.1 * reach;
              s.feet[0].set(-0.11, 0, 0);
              s.feet[1].set(0.11, 0, 0);
              s.hands[1].set(0.3, 0.82, 0.05);
              s.hands[0].set(-0.3 + 0.1 * g, 0.82 + 0.16 * g, 0.05 + 0.18 * g);
              toLocal(m, grip.x, grip.y + 0.03 * Math.sin(time * 13) * shake, grip.z, handTarget);
              s.hands[0].lerp(handTarget, reach);
              s.headX = 0.06 + 0.12 * shake * Math.sin(time * 5);
              s.headY = 0.1 * Math.sin(time * 0.7 + facing);
              s.talk = speaking ? 0.5 * (0.5 + 0.5 * Math.sin(time * 12 + facing)) : 0;
              s.smile = 0.2 + 0.7 * reach;
              m.person.apply(s);
            };

            officeLife.tickers.push((time) => {
              const t = time % CYCLE;
              const talking = t < 10;
              const sellerSpeaks = talking && (Math.floor(t / 2.5) % 2 === 0);
              const buyerSpeaks = talking && !sellerSpeaks;
              const reach = ss(11, 13, t) * (1 - ss(20, 22, t));
              const shake = ss(13.5, 14.2, t) * (1 - ss(19, 19.6, t));
              const look = ss(10.5, 12, t) * (1 - ss(22, 24, t));

              sitTalk(seller, time, sellerSpeaks, 1, look * 0.7);
              sitTalk(buyer, time, buyerSpeaks, -1, look * 0.7);
              standTalk(closerA, closerB, time, sellerSpeaks, reach, shake, 0);
              standTalk(closerB, closerA, time, buyerSpeaks, reach, shake, 2);

              const checked = t > 8.5 ? 3 : t > 6 ? 2 : t > 3 ? 1 : 0;
              const closed = t > 14 && t < 26;
              const key = `${checked}${closed}`;
              if (key !== lastKey) {
                lastKey = key;
                paintDeal(checked, closed);
              }
            });
          };

          buildMeetingRoom();

          // Canto de descanso no lado leste do 3º andar: sofá e plantas
          const lounge = floors[2].group;
          addMesh(lounge, box(2.0, 0.4, 0.8), chairMat, 3.2, 0.3, bz + 0.9);
          addMesh(lounge, box(2.0, 0.5, 0.15), chairMat, 3.2, 0.7, bz + 1.25);
          [[4.4, bz - 0.6], [1.6, bz + 1.2]].forEach(([px, pz]) => {
            addMesh(lounge, new THREE.CylinderGeometry(0.2, 0.16, 0.4, 10), mat('#c0504a', 0.6), px, 0.3, pz);
            addMesh(lounge, new THREE.SphereGeometry(0.34, 8, 6), mat('#4f8f5b', 0.7), px, 0.8, pz);
          });

          const dashCanvas = document.createElement('canvas');
          dashCanvas.width = treetechDashboard.width;
          dashCanvas.height = treetechDashboard.height;
          treetechDashboard.ctx = dashCanvas.getContext('2d');
          treetechDashboard.texture = new THREE.CanvasTexture(dashCanvas);
          treetechDashboard.texture.anisotropy = 4;

          const wallZ = -3.85;
          const sigmaFurniture = floors[2].furniture;
          addMesh(sigmaFurniture, box(4.9, 1.6, 0.12), mat('#1a2026', 0.5), -8, 1.75, wallZ);
          addMesh(sigmaFurniture, box(0.12, 0.95, 0.12), mat('#1a2026', 0.5), -10.5, 0.475, wallZ);
          addMesh(sigmaFurniture, box(0.12, 0.95, 0.12), mat('#1a2026', 0.5), -5.5, 0.475, wallZ);
          const dashboardScreen = new THREE.Mesh(
            new THREE.PlaneGeometry(4.8, 1.5),
            new THREE.MeshBasicMaterial({ map: treetechDashboard.texture })
          );
          dashboardScreen.position.set(-8, 1.75, wallZ + 0.07);
          sigmaFurniture.add(dashboardScreen);

          // Placa "Treetech" na entrada, legível dos dois lados
          const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
          const signZ = bz + bd / 2 + 3.2;
          [-3.5, 3.5].forEach(px => {
            addMesh(treetechWorld, box(0.15, 2.4, 0.15), mat('#7a8088'), px, 1.2, signZ);
          });
          addMesh(treetechWorld, box(7.4, 1.5, 0.12), mat('#f4f7f5'), 0, 2.6, signZ);
          const signFront = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 1.4), signMat);
          signFront.position.set(0, 2.6, signZ + 0.07);
          treetechWorld.add(signFront);
          const signBack = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 1.4), signMat);
          signBack.position.set(0, 2.6, signZ - 0.07);
          signBack.rotation.y = Math.PI;
          treetechWorld.add(signBack);

          treetechRoof.apply = (amount) => {
            floors.forEach((floor, level) => {
              floor.walls.scale.y = 1 - 0.7 * amount;
              floor.group.position.y = level * (FLOOR_PITCH + EXPLODE_GAP * amount);
            });
          };
          treetechRoof.panelY = () => treetechWorld.position.y + floors[2].group.position.y + 0.1 + 1.75;
          treetechRoof.roof = roof;
          treetechRoof.hit = building;
          treetechRoofApiRef.current = { setOpen: (open) => { treetechRoof.open = open; } };
        };

        buildTreetech();
