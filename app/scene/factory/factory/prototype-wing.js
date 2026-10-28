          // Ala de desenvolvimento de protótipos: três salas atrás da linha de produção
          const annexH = 3.4;
          const labFloorMat = mat('#d8d6d0', 0.8);
          addSlab(factoryWorld, 16, 0.6, 3, mat('#c9ccce', 0.8), 0, -0.3, 9.5, false);
          addSlab(factoryWorld, 16.6, 0.1, 3.3, mat('#7aa58a', 0.8), 0, -0.06, 9.65, false);
          addSlab(building, 14, 0.1, 5.5, labFloorMat, 0, 0.05, 6.75, false);
          addSlab(walls, 14, annexH, 0.25, wallMat, 0, annexH / 2, 9.375);
          [-6.875, 6.875].forEach(wx => addSlab(walls, 0.25, annexH, 5.5, wallMat, wx, annexH / 2, 6.75));
          [-2.3, 2.3].forEach(wx => addSlab(walls, 0.2, annexH, 3.85, wallMat, wx, annexH / 2, 7.325));
          addSlab(walls, 14.02, 0.4, 0.27, moduleStripeMat, 0, 0.5, 9.375, false);
          addSlab(roof, 14.8, 0.2, 6.0, roofMat, 0, 0.1 + annexH + 0.1, 6.7);

          const makePlaque = (text) => {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 80;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#f4f7f5';
            ctx.fillRect(0, 0, 512, 80);
            ctx.fillStyle = BRAND_GREEN;
            ctx.fillRect(0, 0, 12, 80);
            ctx.fillStyle = '#2b323a';
            ctx.font = 'bold 38px Arial, sans-serif';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, 28, 42);
            return new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas) });
          };
          [[-4.65, 'Eletrônica'], [0, 'Testes e ensaios'], [4.65, 'Projeto e P&D']].forEach(([cx, text]) => {
            addSlab(walls, 1.4, 0.9, 0.04, glassMat, cx - 0.8, 1.9, 9.51, false);
            addSlab(walls, 0.9, 2.0, 0.05, doorMat, cx + 1.2, 1.0, 9.51, false);
            const plaque = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.375), makePlaque(text));
            plaque.position.set(cx, 2.95, 9.52);
            walls.add(plaque);
          });

          const benchMat = mat('#a8896a', 0.7);
          const pcbMat = mat('#2f6b4a', 0.6);
          const darkLab = mat('#3a4048', 0.5);
          const screenLab = new THREE.MeshStandardMaterial({ color: '#8fb4c8', emissive: '#6ea8c0', emissiveIntensity: 0.6, roughness: 0.3 });
          const addBench = (x, z, w) => {
            addSlab(furniture, w, 0.08, 0.9, benchMat, x, 0.9, z);
            [-w / 2 + 0.1, w / 2 - 0.1].forEach(lx => addSlab(furniture, 0.08, 0.86, 0.8, metalMat, x + lx, 0.43, z));
          };
          const addEngineer = (x, z, color) => {
            const engineer = createWorker(color);
            engineer.position.set(x, 0.1, z);
            engineer.userData.leftArm.rotation.x = -0.9;
            engineer.userData.rightArm.rotation.x = -0.9;
            building.add(engineer);
            factoryWorkers.push({ group: engineer, phase: x * 1.3 });
          };
