        // 1. TERRENO E BASE
        // Chão único: um quadrado de grama sob toda a cena (subestação, usina, cidade, Treetech e fábrica)
        const worldGround = new THREE.Mesh(new THREE.BoxGeometry(100, 0.4, 100), matGrass);
        worldGround.position.set(33, -0.23, 4.5);
        worldGround.receiveShadow = true;
        scene.add(worldGround);

        // Placa de Concreto da Subestação
        const padGeo = new THREE.BoxGeometry(16, 0.3, 16);
        const padMesh = new THREE.Mesh(padGeo, matConcrete);
        padMesh.position.y = 0.15;
        padMesh.receiveShadow = true;
        padMesh.castShadow = true;
        substationGroup.add(padMesh);

        // Brita/Gravel Layer
        const gravelGeo = new THREE.BoxGeometry(15.2, 0.05, 15.2);
        const matGravel = new THREE.MeshStandardMaterial({ color: '#8d9296', roughness: 0.95 });
        const gravelMesh = new THREE.Mesh(gravelGeo, matGravel);
        gravelMesh.position.y = 0.32;
        gravelMesh.receiveShadow = true;
        substationGroup.add(gravelMesh);

        // 2. CERCA DE SEGURANÇA AMARELA
        const createFence = () => {
          const fenceGroup = new THREE.Group();
          const pMin = -7.3;
          const pMax = 7.3;
          const height = 1.8;
          // Portão no lado leste (para a usina): vão entre gateZ - gateHalf e gateZ + gateHalf
          const gateZ = 0.35;
          const gateHalf = 1.4;
          // Portão no lado sul, na ponta da estrada das vans
          const southGateX = -4;

          // Postes de Canto e Intermediários
          const postGeo = new THREE.CylinderGeometry(0.06, 0.06, height);
          const fencePositions = [];

          for (let i = pMin; i <= pMax; i += 1.83) {
            fencePositions.push([i, pMin], [pMin, i]);
            if (Math.abs(i - southGateX) > gateHalf) fencePositions.push([i, pMax]);
            if (Math.abs(i - gateZ) > gateHalf) fencePositions.push([pMax, i]);
          }
          fencePositions.push([pMax, gateZ - gateHalf], [pMax, gateZ + gateHalf]);
          fencePositions.push([southGateX - gateHalf, pMax], [southGateX + gateHalf, pMax]);

          fencePositions.forEach(([x, z]) => {
            const post = new THREE.Mesh(postGeo, matFence);
            post.position.set(x, 0.3 + height / 2, z);
            post.castShadow = true;
            fenceGroup.add(post);
          });

          // Trilhos Horizontais de Cerca
          const createRail = (x1, z1, x2, z2, h) => {
            const dx = x2 - x1;
            const dz = z2 - z1;
            const len = Math.sqrt(dx * dx + dz * dz);
            const railGeo = new THREE.BoxGeometry(0.04, 0.04, len);
            const rail = new THREE.Mesh(railGeo, matFence);
            rail.position.set((x1 + x2) / 2, h, (z1 + z2) / 2);
            rail.rotation.y = Math.atan2(dx, dz);
            fenceGroup.add(rail);
          };

          const heights = [0.5, 1.2, 1.9];
          heights.forEach(h => {
            createRail(pMin, pMin, pMax, pMin, h);
            createRail(pMin, pMax, southGateX - gateHalf, pMax, h);
            createRail(southGateX + gateHalf, pMax, pMax, pMax, h);
            createRail(pMin, pMin, pMin, pMax, h);
            createRail(pMax, pMin, pMax, gateZ - gateHalf, h);
            createRail(pMax, gateZ + gateHalf, pMax, pMax, h);
          });

          // Placa de Sinalização "PERIGO ALTA TENSÃO ⚡"
          const signGeo = new THREE.PlaneGeometry(0.6, 0.4);
          const matSign = new THREE.MeshBasicMaterial({ color: '#fef08a', side: THREE.DoubleSide });
          const sign = new THREE.Mesh(signGeo, matSign);
          sign.position.set(0, 1.2, pMax + 0.02);
          fenceGroup.add(sign);

          return fenceGroup;
        };
        substationGroup.add(createFence());

        // Helper para criar Isoladores cerâmicos marrons sanfonados
        const createBushing = (height = 1.2, radius = 0.18) => {
          const group = new THREE.Group();
          const coreGeo = new THREE.CylinderGeometry(radius * 0.6, radius * 0.6, height, 16);
          const core = new THREE.Mesh(coreGeo, matPorcelain);
          core.castShadow = true;
          group.add(core);

          // Anéis/Discos de Saia Cerâmica
          const ringCount = Math.floor(height * 6);
          const ringGeo = new THREE.TorusGeometry(radius, radius * 0.22, 8, 16);
          ringGeo.rotateX(Math.PI / 2);

          for (let i = 0; i < ringCount; i++) {
            const ring = new THREE.Mesh(ringGeo, matPorcelain);
            ring.position.y = -height / 2 + (i + 0.5) * (height / ringCount);
            ring.castShadow = true;
            group.add(ring);
          }

          // Terminal metálico superior
          const capGeo = new THREE.CylinderGeometry(radius * 0.5, radius * 0.5, 0.15, 12);
          const cap = new THREE.Mesh(capGeo, matSteel);
          cap.position.y = height / 2 + 0.075;
          group.add(cap);

          return group;
        };
