        // 10. CIDADE E TORRES DE TRANSMISSÃO AO LADO DA SUBESTAÇÃO
        const cityWorld = new THREE.Group();
        cityWorld.position.set(46, 0, -16.5);
        scene.add(cityWorld);

        const matLatticeSteel = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.15 });
        const matSteelJoint = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 });
        const matInsulator = new THREE.MeshStandardMaterial({ color: 0x9a6b52, roughness: 0.2, metalness: 0.1 });
        const matSubstationBase = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.6 });
        const matYellowStripe = new THREE.MeshStandardMaterial({ color: 0xcbb877, roughness: 0.3 });
        const matRoad = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });
        const matRoadLine = new THREE.MeshStandardMaterial({ color: 0xcdbf8a, roughness: 0.3 });
        const matGrassPlot = new THREE.MeshStandardMaterial({ color: 0xa8bd98, roughness: 0.7 });
        const matConcreteCurb = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
        const matWhiteWall = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
        const matTrunkWood = new THREE.MeshStandardMaterial({ color: 0x7a6048, roughness: 0.8 });
        const matTreeFoliage = new THREE.MeshStandardMaterial({ color: 0x6f9a6a, roughness: 0.6 });

        const cityPulses = [];
        const cityWires = [];
        const cityWindows = [];

        const duskGlows = [];
        const duskWindowMats = [];
        const duskLamps = [];
        const duskLightMats = [];
        const duskInteriorLights = [];
        const glowTexture = (() => {
          const c = document.createElement('canvas');
          c.width = 128;
          c.height = 128;
          const g = c.getContext('2d');
          const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
          grad.addColorStop(0, 'rgba(255,230,170,1)');
          grad.addColorStop(0.4, 'rgba(255,200,120,0.45)');
          grad.addColorStop(1, 'rgba(255,190,100,0)');
          g.fillStyle = grad;
          g.fillRect(0, 0, 128, 128);
          return new THREE.CanvasTexture(c);
        })();
        const headlightMat = new THREE.MeshStandardMaterial({ color: '#fff6d8', emissive: '#fff0c0', emissiveIntensity: 0.2 });
        const taillightMat = new THREE.MeshStandardMaterial({ color: '#c04040', emissive: '#ff3020', emissiveIntensity: 0.2 });
        duskLightMats.push({ mat: headlightMat, day: 0.2, dusk: 1.8 }, { mat: taillightMat, day: 0.2, dusk: 1.2 });

        const addGlow = (parent, x, y, z, size, max, color = 0xffe0a0) => {
          const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: glowTexture, color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0
          }));
          sprite.position.set(x, y, z);
          sprite.scale.set(size, size, 1);
          sprite.visible = false;
          parent.add(sprite);
          const glow = { obj: sprite, max, city: false };
          duskGlows.push(glow);
          return glow;
        };

        const addVehicleLights = (group, frontZ, backZ, y, halfW) => {
          const lightGeo = new THREE.BoxGeometry(0.16, 0.1, 0.04);
          [-halfW, halfW].forEach(x => {
            const head = new THREE.Mesh(lightGeo, headlightMat);
            head.position.set(x, y, frontZ);
            group.add(head);
            const tail = new THREE.Mesh(lightGeo, taillightMat);
            tail.position.set(x, y, backZ);
            group.add(tail);
          });
          addGlow(group, 0, y, frontZ + 0.5, 1.8, 0.6);
          addGlow(group, 0, y, backZ - 0.3, 0.9, 0.35, 0xff6a4a);
        };

        // Torre de transmissão em treliça com isoladores cerâmicos
        const createTransmissionPylon = (x, z) => {
          const pylon = new THREE.Group();
          pylon.position.set(x, 0, z);

          const padBase = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 0.2, 32), matYellowStripe);
          padBase.position.y = 0.1;
          padBase.receiveShadow = true;
          pylon.add(padBase);

          const pad = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.25, 32), matSubstationBase);
          pad.position.y = 0.25;
          pad.receiveShadow = true;
          pylon.add(pad);

          const towerHeight = 12.5;

          for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2 + Math.PI / 4;
            const botR = 1.45;
            const topR = 0.42;

            const x1 = Math.cos(angle) * botR;
            const z1 = Math.sin(angle) * botR;
            const x2 = Math.cos(angle) * topR;
            const z2 = Math.sin(angle) * topR;

            const legGeo = new THREE.CylinderGeometry(0.1, 0.13, towerHeight, 8);
            const leg = new THREE.Mesh(legGeo, matLatticeSteel);
            leg.position.set((x1 + x2) / 2, towerHeight / 2 + 0.35, (z1 + z2) / 2);
            leg.rotation.z = Math.atan2(x1 - x2, towerHeight);
            leg.rotation.x = Math.atan2(z2 - z1, towerHeight);
            leg.castShadow = true;
            pylon.add(leg);
          }

          const levels = 6;
          for (let l = 1; l <= levels; l++) {
            const h = (towerHeight / levels) * l + 0.35;
            const ringR = 1.45 - (l / levels) * 1.03;
            const ring = new THREE.Mesh(new THREE.TorusGeometry(ringR, 0.05, 4, 4), matSteelJoint);
            ring.position.y = h;
            ring.rotation.x = Math.PI / 2;
            pylon.add(ring);
          }

          const armHeights = [towerHeight - 1.2, towerHeight + 0.4];
          const armWidths = [5.2, 3.6];
          const attachmentHooks = [];

          armHeights.forEach((ah, idx) => {
            const w = armWidths[idx];
            const arm = new THREE.Mesh(new THREE.BoxGeometry(w, 0.16, 0.35), matLatticeSteel);
            arm.position.y = ah;
            arm.castShadow = true;
            pylon.add(arm);

            [-w / 2 + 0.3, 0, w / 2 - 0.3].forEach(xOffset => {
              const insGroup = new THREE.Group();
              insGroup.position.set(xOffset, ah - 0.1, 0);

              for (let k = 0; k < 4; k++) {
                const insDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.14, 0.15, 12), matInsulator);
                insDisc.position.y = -(k * 0.18);
                insGroup.add(insDisc);
              }
              pylon.add(insGroup);
              attachmentHooks.push(new THREE.Vector3(x + xOffset, ah - 0.9, z));
            });
          });

          cityWorld.add(pylon);
          return { hooks: attachmentHooks };
        };

        const pylon1 = createTransmissionPylon(-12, 12);
        const pylon2 = createTransmissionPylon(-2, 12);

        // Cabo em catenária (verde-menta) entre dois pontos
        const createCatenaryWire = (p1, p2, sag = 1.4, colorHex = 0x6fa08f) => {
          const points = [];
          const steps = 24;
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            points.push(new THREE.Vector3(
              p1.x + (p2.x - p1.x) * t,
              p1.y + (p2.y - p1.y) * t - Math.sin(t * Math.PI) * sag,
              p1.z + (p2.z - p1.z) * t
            ));
          }
          const curve = new THREE.CatmullRomCurve3(points);
          const cableMat = new THREE.MeshStandardMaterial({
            color: colorHex,
            roughness: 0.2,
            metalness: 0.3,
            emissive: colorHex,
            emissiveIntensity: 0.2
          });
          const wireMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.08, 8, false), cableMat);
          cityWorld.add(wireMesh);
          cityWires.push({ mesh: wireMesh, baseColor: colorHex });
          return curve;
        };

        const mainWireCurves = [];

        // Pórtico da subestação -> Torre 1 (coordenadas locais da cidade: mundo - deslocamento)
        [-2, 0, 2].forEach((gx, i) => {
          const gantryHook = new THREE.Vector3(gx - 46, 6.25, 12);
          mainWireCurves.push(createCatenaryWire(gantryHook, pylon1.hooks[i], 1.2));
        });

        // Torre 1 -> Torre 2
        for (let i = 0; i < 3; i++) {
          mainWireCurves.push(createCatenaryWire(pylon1.hooks[i], pylon2.hooks[i], 1.6));
        }

        // Chão e ruas da cidade
        const cityGround = new THREE.Mesh(new THREE.BoxGeometry(34, 0.2, 34), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }));
        cityGround.position.set(8, -0.1, -2);
        cityGround.receiveShadow = true;
        cityWorld.add(cityGround);

        const roadH = new THREE.Mesh(new THREE.BoxGeometry(34, 0.22, 5), matRoad);
        roadH.position.set(8, -0.08, 0);
        roadH.receiveShadow = true;
        cityWorld.add(roadH);

        const roadV = new THREE.Mesh(new THREE.BoxGeometry(5, 0.22, 34), matRoad);
        roadV.position.set(8, -0.08, -2);
        roadV.receiveShadow = true;
        cityWorld.add(roadV);

        for (let r = -8; r <= 24; r += 3.5) {
          const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.24, 0.22), matRoadLine);
          stripe.position.set(r, -0.06, 0);
          cityWorld.add(stripe);
        }

        // Casas e sobrados
        const housePlots = [
          { x: -3, z: -8, color: 0xa35a52, stories: 1, rooms: ['tv'], outside: 'ev' },
          { x: 5, z: -8, color: 0x4a5a7a, stories: 2, rooms: ['kitchen', 'game'], outside: 'mower' },
          { x: 13, z: -8, color: 0xb08a5a, stories: 1, rooms: ['office'], outside: 'grill' },
          { x: 20, z: -8, color: 0x5f8a7c, stories: 2, rooms: ['laundry', 'bed'], outside: 'hedge' },
          { x: -3, z: 8, color: 0x7d6d9a, stories: 2, rooms: ['kitchen', 'office'], outside: 'patio' },
          { x: 5, z: 8, color: 0xa8606c, stories: 1, rooms: ['vacuum'], outside: 'pwash' },
          { x: 13, z: 8, color: 0x5f8aa5, stories: 2, rooms: ['tv', 'fan'], outside: 'guitar' },
          { x: 20, z: 8, color: 0x46515f, stories: 1, rooms: ['kitchen'], outside: 'drone' }
        ];

        housePlots.forEach((plot, plotIdx) => {
          const plotGroup = new THREE.Group();
          plotGroup.position.set(plot.x, 0, plot.z);
          if (plot.z > 0) plotGroup.rotation.y = Math.PI;

          const plotBase = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.35, 6.4), matGrassPlot);
          plotBase.position.y = 0.17;
          plotBase.receiveShadow = true;
          plotGroup.add(plotBase);

          const border = new THREE.Mesh(new THREE.BoxGeometry(6.7, 0.18, 6.7), matConcreteCurb);
          border.position.y = 0.08;
          plotGroup.add(border);

          const height = plot.stories === 2 ? 3.8 : 2.2;
          homeKit.buildHome(plotGroup, plot, plotIdx, cityWindows);

          const roofMat = new THREE.MeshStandardMaterial({ color: plot.color, roughness: 0.3 });
          if (plot.stories === 1) {
            const roof = new THREE.Mesh(new THREE.ConeGeometry(3.1, 1.9, 4), roofMat);
            roof.position.y = 0.35 + height + 0.95;
            roof.rotation.y = Math.PI / 4;
            roof.castShadow = true;
            plotGroup.add(roof);
          } else {
            const roof = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.45, 3.4), roofMat);
            roof.position.y = 0.35 + height + 0.22;
            roof.castShadow = true;
            plotGroup.add(roof);
          }

          const createTree = (tx, tz) => {
            const tree = new THREE.Group();
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.2, 8), matTrunkWood);
            trunk.position.set(tx, 0.6, tz);
            tree.add(trunk);

            const foliage = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.9, 8), matTreeFoliage);
            foliage.position.set(tx, 1.85, tz);
            foliage.castShadow = true;
            tree.add(foliage);
            return tree;
          };

          plotGroup.add(createTree(-2.3, -2.2));
          plotGroup.add(createTree(2.3, -2.2));

          cityWorld.add(plotGroup);
        });

        // Postes de distribuição e ligação com as casas
        const utilityPolePositions = [
          { x: -3, z: -3 }, { x: 5, z: -3 }, { x: 13, z: -3 }, { x: 20, z: -3 },
          { x: -3, z: 3 }, { x: 5, z: 3 }, { x: 13, z: 3 }, { x: 20, z: 3 }
        ];

        const poleHooks = [];

        utilityPolePositions.forEach((pos, idx) => {
          const poleGroup = new THREE.Group();
          poleGroup.position.set(pos.x, 0, pos.z);

          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 5.5, 8), matSubstationBase);
          pole.position.y = 2.75;
          pole.castShadow = true;
          poleGroup.add(pole);

          const poleArm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.15), matRoad);
          poleArm.position.y = 5.0;
          poleGroup.add(poleArm);

          if (idx % 2 === 0) {
            const poleTrans = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.8, 10), matSteelJoint);
            poleTrans.position.set(0.35, 4.2, 0);
            poleGroup.add(poleTrans);
          }

          poleHooks.push(new THREE.Vector3(pos.x, 4.9, pos.z));
          cityWorld.add(poleGroup);
        });

        mainWireCurves.push(
          createCatenaryWire(pylon2.hooks[1], poleHooks[0], 1.2, 0x6f9aa8),
          createCatenaryWire(poleHooks[0], poleHooks[1], 0.8, 0x6f9aa8),
          createCatenaryWire(poleHooks[1], poleHooks[2], 0.8, 0x6f9aa8),
          createCatenaryWire(poleHooks[2], poleHooks[3], 0.8, 0x6f9aa8)
        );

        // Postes de luz ao longo das ruas: haste, braço voltado para a rua e luminária acesa
        const streetPoleMat = new THREE.MeshStandardMaterial({ color: '#8a949e', roughness: 0.5, metalness: 0.4 });
        const streetLampMat = new THREE.MeshStandardMaterial({ color: '#f3e6a8', emissive: '#f3e6a8', emissiveIntensity: 1.0, roughness: 0.4 });
        const streetLamps = [
          [-6.5, -3.1, 1], [-6.5, 3.1, -1], [1, -3.1, 1], [1, 3.1, -1],
          [16.5, -3.1, 1], [16.5, 3.1, -1], [22.5, -3.1, 1], [22.5, 3.1, -1],
          [6, -15, 1], [10, -15, 1], [6, 12.5, -1], [10, 12.5, -1]
        ];
        streetLamps.forEach(([lx, lz, toward]) => {
          const lamp = new THREE.Group();
          lamp.position.set(lx, 0, lz);

          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 4.2, 8), streetPoleMat);
          post.position.y = 2.1;
          post.castShadow = true;
          lamp.add(post);

          const arm = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 1.0), streetPoleMat);
          arm.position.set(0, 4.15, toward * 0.5);
          lamp.add(arm);

          const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.5), streetLampMat);
          head.position.set(0, 4.08, toward * 1.0);
          lamp.add(head);

          duskLamps.push({ pos: new THREE.Vector3(cityWorld.position.x + lx, 4.08, cityWorld.position.z + lz + toward), city: true });
          cityWorld.add(lamp);
        });

        housePlots.forEach((hp, idx) => {
          const houseHook = new THREE.Vector3(hp.x, hp.stories === 2 ? 4.2 : 2.8, hp.z);
          createCatenaryWire(poleHooks[idx], houseHook, 0.4, 0x475569);
        });

        // Pulsos de energia correndo pelos cabos principais
        mainWireCurves.forEach(curve => {
          for (let p = 0; p < 2; p++) {
            const particle = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), new THREE.MeshBasicMaterial({ color: 0xd8c98a }));
            particle.userData = { curve, progress: Math.random(), speed: 0.009 };
            cityWorld.add(particle);
            cityPulses.push(particle);
          }
        });
