        // 11. USINA ELÉTRICA AO LADO DA SUBESTAÇÃO (modelo enviado pelo usuário)
        const plantWorld = new THREE.Group();
        plantWorld.position.set(16.4, 0.3, 0);
        plantWorld.rotation.y = Math.PI;
        scene.add(plantWorld);

        const plantFans = [];
        const plantParts = {};
        const plantSteam = [];
        const plantSeated = [];
        const plantOfficeWalker = { group: null, path: null };
        const plantRoof = { open: false, amount: 0, walls: null, roof: null, hit: null };
        const treetechRoof = { open: false, amount: 0, walls: null, roof: null, hit: null };
        const roofToggles = [plantRoof, treetechRoof];
        const treetechLed = { mesh: null };
        const treetechWalker = { group: null, path: null };
        const treetechDashboard = { ctx: null, texture: null, width: 1920, height: 600 };

        const buildPowerPlant = () => {
          // Texturas procedurais: faixa de perigo, persiana e janelas em grade
          const hazardCanvas = document.createElement('canvas');
          hazardCanvas.width = 512;
          hazardCanvas.height = 64;
          const hCtx = hazardCanvas.getContext('2d');
          hCtx.fillStyle = '#cdb97a';
          hCtx.fillRect(0, 0, 512, 64);
          hCtx.fillStyle = '#a8625c';
          for (let i = -64; i < 512 + 64; i += 32) {
            hCtx.beginPath();
            hCtx.moveTo(i, 0);
            hCtx.lineTo(i + 16, 0);
            hCtx.lineTo(i - 16, 64);
            hCtx.lineTo(i - 32, 64);
            hCtx.closePath();
            hCtx.fill();
          }
          const hazardTex = new THREE.CanvasTexture(hazardCanvas);
          hazardTex.wrapS = THREE.RepeatWrapping;
          hazardTex.wrapT = THREE.RepeatWrapping;
          hazardTex.repeat.set(8, 1);

          const ventCanvas = document.createElement('canvas');
          ventCanvas.width = 128;
          ventCanvas.height = 128;
          const vCtx = ventCanvas.getContext('2d');
          vCtx.fillStyle = '#3a4149';
          vCtx.fillRect(0, 0, 128, 128);
          vCtx.fillStyle = '#1e2227';
          for (let y = 8; y < 128; y += 12) {
            vCtx.fillRect(8, y, 112, 6);
          }
          const ventTex = new THREE.CanvasTexture(ventCanvas);

          const winCanvas = document.createElement('canvas');
          winCanvas.width = 256;
          winCanvas.height = 256;
          const wCtx = winCanvas.getContext('2d');
          wCtx.fillStyle = '#8f9ba6';
          wCtx.fillRect(0, 0, 256, 256);
          wCtx.fillStyle = '#2b323a';
          for (let x = 16; x < 256; x += 40) {
            for (let y = 16; y < 256; y += 40) {
              wCtx.fillRect(x, y, 28, 28);
            }
          }
          const winTex = new THREE.CanvasTexture(winCanvas);

          // Materiais
          const concreteMat = new THREE.MeshStandardMaterial({ color: '#a0aab3', roughness: 0.65, metalness: 0.1 });
          const orangeMat = new THREE.MeshStandardMaterial({ color: '#b8896c', roughness: 0.5 });
          const roofRedMat = new THREE.MeshStandardMaterial({ color: '#8f5a52', roughness: 0.5 });
          const darkMetalMat = new THREE.MeshStandardMaterial({ color: '#33383f', roughness: 0.4, metalness: 0.7 });
          const silverPipeMat = new THREE.MeshStandardMaterial({ color: '#c5cbcf', roughness: 0.25, metalness: 0.85 });
          const redChamberMat = new THREE.MeshStandardMaterial({ color: '#a8625c', roughness: 0.4 });
          const yellowStripMat = new THREE.MeshStandardMaterial({ color: '#c9b273', roughness: 0.4 });
          const insulatorMat = new THREE.MeshStandardMaterial({ color: '#903323', roughness: 0.3 });
          const transformerMat = new THREE.MeshStandardMaterial({ color: '#566068', roughness: 0.5, metalness: 0.5 });

          // 1. Base e borda de perigo
          const basePad = new THREE.Mesh(new THREE.BoxGeometry(16, 0.6, 16), new THREE.MeshStandardMaterial({ color: '#b2b9c0', roughness: 0.8 }));
          basePad.position.y = -0.3;
          basePad.receiveShadow = true;
          plantWorld.add(basePad);

          const borderRim = new THREE.Mesh(new THREE.BoxGeometry(16.8, 0.2, 16.8), new THREE.MeshStandardMaterial({ map: hazardTex, roughness: 0.5 }));
          borderRim.position.y = -0.05;
          borderRim.receiveShadow = true;
          plantWorld.add(borderRim);

          // 2. Prédio principal alto com duas chaminés
          const mainBuildingGroup = new THREE.Group();

          const mainMesh = new THREE.Mesh(
            new THREE.BoxGeometry(4.6, 6.8, 4.6),
            new THREE.MeshStandardMaterial({ color: '#9ca6b0', map: winTex, roughness: 0.6 })
          );
          mainMesh.position.set(-3.2, 3.4, -3.2);
          mainMesh.castShadow = true;
          mainMesh.receiveShadow = true;
          mainBuildingGroup.add(mainMesh);

          const roofBox = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 2.2), concreteMat);
          roofBox.position.set(-3.2, 7.3, -3.2);
          roofBox.castShadow = true;
          mainBuildingGroup.add(roofBox);

          const createChimney = (x, z, height, radiusBottom, radiusTop, stripes) => {
            const chimGroup = new THREE.Group();
            const chimMesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 24), concreteMat);
            chimMesh.castShadow = true;
            chimGroup.add(chimMesh);

            stripes.forEach(yOffset => {
              const ringMesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop + 0.02, radiusTop + 0.04, 0.45, 24), redChamberMat);
              ringMesh.position.y = yOffset;
              chimGroup.add(ringMesh);
            });

            chimGroup.position.set(x, height / 2 + 6.8, z);
            return chimGroup;
          };

          mainBuildingGroup.add(createChimney(-4.0, -4.0, 5.2, 0.75, 0.55, [1.5, 0.6]));
          mainBuildingGroup.add(createChimney(-2.4, -4.2, 4.2, 0.60, 0.45, [1.2, 0.4]));
          plantWorld.add(mainBuildingGroup);
          plantParts.main = mainBuildingGroup;

          // 3. Prédio intermediário com ventoinhas no teto
          const midBuildingGroup = new THREE.Group();

          const midMesh = new THREE.Mesh(new THREE.BoxGeometry(4.4, 4.8, 4.4), new THREE.MeshStandardMaterial({ color: '#88949e', roughness: 0.6 }));
          midMesh.position.set(1.5, 2.4, -3.2);
          midMesh.castShadow = true;
          midMesh.receiveShadow = true;
          midBuildingGroup.add(midMesh);

          const ventGeo = new THREE.PlaneGeometry(1.8, 1.2);
          const ventMat = new THREE.MeshStandardMaterial({ map: ventTex, roughness: 0.4 });
          const ventMesh1 = new THREE.Mesh(ventGeo, ventMat);
          ventMesh1.position.set(1.5, 3.2, -0.99);
          midBuildingGroup.add(ventMesh1);

          const ventMesh2 = ventMesh1.clone();
          ventMesh2.position.set(1.5, 1.6, -0.99);
          midBuildingGroup.add(ventMesh2);

          const createRoofFan = (x, z, scale = 1, roofY = 4.85) => {
            const fanGroup = new THREE.Group();
            fanGroup.position.set(x, roofY, z);

            const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.75 * scale, 0.8 * scale, 0.3 * scale, 24), darkMetalMat);
            housing.position.y = 0.15 * scale;
            housing.castShadow = true;
            fanGroup.add(housing);

            const rim = new THREE.Mesh(new THREE.TorusGeometry(0.7 * scale, 0.05 * scale, 8, 24), yellowStripMat);
            rim.rotation.x = Math.PI / 2;
            rim.position.y = 0.3 * scale;
            fanGroup.add(rim);

            const bladeGroup = new THREE.Group();
            bladeGroup.position.y = 0.25 * scale;
            const bladeGeo = new THREE.BoxGeometry(1.2 * scale, 0.02 * scale, 0.18 * scale);
            for (let i = 0; i < 4; i++) {
              const blade = new THREE.Mesh(bladeGeo, darkMetalMat);
              blade.rotation.y = (i * Math.PI) / 4;
              bladeGroup.add(blade);
            }
            fanGroup.add(bladeGroup);
            plantFans.push(bladeGroup);

            return fanGroup;
          };

          [[0.4, -2.2], [2.6, -2.2], [0.4, -4.2], [2.6, -4.2]].forEach(([fx, fz]) => {
            midBuildingGroup.add(createRoofFan(fx, fz, 0.95));
          });
          plantWorld.add(midBuildingGroup);
          plantParts.mid = midBuildingGroup;

          // 4. Prédio laranja frontal, baixo, com chaminés listradas
          const frontBuildingGroup = new THREE.Group();

          // Piso e paredes do escritório (as paredes baixam quando o telhado abre)
          const officeFloor = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.1, 4.2), new THREE.MeshStandardMaterial({ color: '#c9c2b6', roughness: 0.8 }));
          officeFloor.position.set(-2.6, 0.05, 1.8);
          officeFloor.receiveShadow = true;
          frontBuildingGroup.add(officeFloor);

          const officeWalls = new THREE.Group();
          officeWalls.position.y = 0.1;
          const addWall = (sx, sz, px, pz) => {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(sx, 2.5, sz), orangeMat);
            wall.position.set(px, 1.25, pz);
            wall.castShadow = true;
            wall.receiveShadow = true;
            officeWalls.add(wall);
          };
          addWall(5.8, 0.2, -2.6, -0.2);
          addWall(5.8, 0.2, -2.6, 3.8);
          addWall(0.2, 3.8, -5.4, 1.8);
          addWall(0.2, 3.8, 0.2, 1.8);

          const officeWindowMat = new THREE.MeshStandardMaterial({ color: '#7f98aa', roughness: 0.3 });
          [-4.2, -1.0].forEach(wx => {
            [3.92, -0.32].forEach(wz => {
              const win = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.04), officeWindowMat);
              win.position.set(wx, 1.4, wz);
              officeWalls.add(win);
            });
          });

          // Telhado com chaminés e ventoinhas: some junto quando o escritório abre
          const frontRoofGroup = new THREE.Group();
          const roofPlate = new THREE.Mesh(new THREE.BoxGeometry(5.82, 0.2, 4.22), roofRedMat);
          roofPlate.position.set(-2.6, 2.7, 1.8);
          roofPlate.castShadow = true;
          frontRoofGroup.add(roofPlate);
          frontBuildingGroup.add(officeWalls, frontRoofGroup);

          const createFrontChimney = (x, z) => {
            const cGroup = new THREE.Group();
            cGroup.position.set(x, 2.8, z);

            const baseCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 3.2, 20), redChamberMat);
            baseCyl.position.y = 1.6;
            baseCyl.castShadow = true;
            cGroup.add(baseCyl);

            const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.49, 0.6, 20), yellowStripMat);
            ring.position.y = 2.2;
            cGroup.add(ring);

            return cGroup;
          };

          frontRoofGroup.add(createFrontChimney(-4.6, 0.8));
          frontRoofGroup.add(createFrontChimney(-3.6, 0.2));

          [[-1.8, 1.0], [-1.8, 2.4], [-0.4, 1.8]].forEach(([fx, fz]) => {
            frontRoofGroup.add(createRoofFan(fx, fz, 0.8, 2.8));
          });

          const pipeCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-5.5, 0.4, 2.2),
            new THREE.Vector3(-5.8, 0.4, 2.2),
            new THREE.Vector3(-5.8, 1.8, 2.2),
            new THREE.Vector3(-5.5, 1.8, 2.2)
          ]);
          const ductMesh = new THREE.Mesh(new THREE.TubeGeometry(pipeCurve, 20, 0.12, 12, false), silverPipeMat);
          ductMesh.castShadow = true;
          frontBuildingGroup.add(ductMesh);
          plantWorld.add(frontBuildingGroup);
          plantParts.office = frontBuildingGroup;

          // Interior do escritório: 3 mesas com PC, 3 pessoas sentadas e 1 pessoa andando
          const officeFurniture = new THREE.Group();
          officeFurniture.position.y = 0.1;
          frontBuildingGroup.add(officeFurniture);

          const deskMat = new THREE.MeshStandardMaterial({ color: '#a8896a', roughness: 0.7 });
          const pcDarkMat = new THREE.MeshStandardMaterial({ color: '#3a4048', roughness: 0.5 });
          const screenMat = new THREE.MeshStandardMaterial({ color: '#8fb4c8', emissive: '#6ea8c0', emissiveIntensity: 0.6, roughness: 0.3 });
          const chairMat = new THREE.MeshStandardMaterial({ color: '#4a5360', roughness: 0.6 });

          const addBox = (size, x, y, z, mat) => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), mat);
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            officeFurniture.add(mesh);
          };

          const DESK_XS = [-4.4, -2.6, -0.8];
          const DESK_Z = 0.65;
          const CHAIR_Z = 1.35;
          const SEATED_COLORS = ['#8aa4c0', '#c0a98a', '#9ab59a'];

          DESK_XS.forEach((dx, index) => {
            // Mesa
            addBox([1.4, 0.06, 0.7], dx, 0.75, DESK_Z, deskMat);
            addBox([0.05, 0.72, 0.6], dx - 0.65, 0.36, DESK_Z, deskMat);
            addBox([0.05, 0.72, 0.6], dx + 0.65, 0.36, DESK_Z, deskMat);
            // PC: monitor com a tela voltada para a cadeira, teclado e torre
            addBox([0.5, 0.32, 0.03], dx, 1.02, DESK_Z - 0.2, screenMat);
            addBox([0.05, 0.14, 0.05], dx, 0.85, DESK_Z - 0.2, pcDarkMat);
            addBox([0.36, 0.02, 0.12], dx, 0.79, DESK_Z + 0.12, pcDarkMat);
            addBox([0.2, 0.42, 0.4], dx + 0.5, 0.21, DESK_Z, pcDarkMat);
            // Cadeira
            addBox([0.42, 0.06, 0.42], dx, 0.45, CHAIR_Z, chairMat);
            addBox([0.42, 0.5, 0.05], dx, 0.72, CHAIR_Z + 0.2, chairMat);
            const chairStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.42, 8), chairMat);
            chairStem.position.set(dx, 0.21, CHAIR_Z);
            officeFurniture.add(chairStem);

            // Pessoa sentada, virada para a mesa, com as pernas à frente e os braços no teclado
            const seated = createWorker(SEATED_COLORS[index]);
            seated.position.set(dx, -0.23, CHAIR_Z);
            seated.rotation.y = Math.PI;
            seated.userData.leftLeg.rotation.x = -1.45;
            seated.userData.rightLeg.rotation.x = -1.45;
            seated.userData.leftArm.rotation.x = -1.0;
            seated.userData.rightArm.rotation.x = -1.0;
            frontBuildingGroup.add(seated);
            plantSeated.push({ worker: seated, phase: index * 2.1 });
          });

          // Pessoa andando pelo corredor atrás das cadeiras
          const officeWalker = createWorker('#9aa7b8');
          officeWalker.position.set(-4.9, 0.1, 2.9);
          frontBuildingGroup.add(officeWalker);
          plantOfficeWalker.group = officeWalker;
          plantOfficeWalker.path = makePath([[-4.9, 2.9], [-0.3, 2.9]], 'pingpong');

          plantRoof.walls = officeWalls;
          plantRoof.roof = frontRoofGroup;
          plantRoof.hit = frontBuildingGroup;
          plantRoofApiRef.current = { setOpen: (open) => { plantRoof.open = open; } };

          // 6. Tambores de óleo
          const createDrum = (x, z, color) => {
            const drum = new THREE.Mesh(
              new THREE.CylinderGeometry(0.22, 0.22, 0.65, 16),
              new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.3 })
            );
            drum.position.set(x, 0.325, z);
            drum.castShadow = true;
            return drum;
          };

          plantWorld.add(createDrum(0.8, 3.6, '#c9b273'));
          plantWorld.add(createDrum(1.3, 3.8, '#a8625c'));
          plantWorld.add(createDrum(0.9, 4.2, '#c9b273'));
          plantWorld.add(createDrum(1.4, 4.4, '#33383f'));

          // 7. Fumaça das chaminés
          const steamGeo = new THREE.SphereGeometry(0.18, 8, 8);
          const steamMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.45 });
          const steamEmitters = [
            { x: -4.0, y: 12.0, z: -4.0 },
            { x: -2.4, y: 11.0, z: -4.2 },
            { x: -4.6, y: 6.0, z: 0.8 },
            { x: -3.6, y: 6.0, z: 0.2 }
          ];

          steamEmitters.forEach(emitter => {
            for (let i = 0; i < 6; i++) {
              const p = new THREE.Mesh(steamGeo, steamMat.clone());
            p.material.userData.preserve = true;
              p.position.set(
                emitter.x + (Math.random() - 0.5) * 0.2,
                emitter.y + Math.random() * 1.5,
                emitter.z + (Math.random() - 0.5) * 0.2
              );
              p.userData = {
                baseY: emitter.y,
                emitterX: emitter.x,
                emitterZ: emitter.z,
                speed: 0.015 + Math.random() * 0.02,
                scaleSpeed: 0.008
              };
              plantWorld.add(p);
              plantSteam.push(p);
            }
          });
        };

        buildPowerPlant();
