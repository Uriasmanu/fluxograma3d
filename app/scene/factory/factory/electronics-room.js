          // Sala 1: bancada de eletrônica com protótipos de módulos e uma estante de caixas
          addBench(-4.5, 8.5, 3.4);
          const { group: staticModule } = createModuleGroup(1.2);
          staticModule.position.set(-3.6, 1.1, 8.5);
          furniture.add(staticModule);
          addSlab(furniture, 0.5, 0.03, 0.35, pcbMat, -3.2, 0.96, 8.3, false);
          addSlab(furniture, 0.4, 1.6, 2.2, metalMat, -6.6, 0.8, 7.0);
          [[-6.6, 0.45, 6.4], [-6.6, 0.45, 7.0], [-6.6, 0.45, 7.6], [-6.6, 1.15, 6.7], [-6.6, 1.15, 7.4]].forEach(([cx, cy, cz]) => addSlab(furniture, 0.5, 0.4, 0.5, crateMat, cx + 0.45, cy, cz));

          const buildPrototyper = () => {
            const skinMat = mat('#f1c7a1', 0.8);
            const coatMat = mat('#f2f5f4', 0.7);
            const hairMat = mat('#4a3426', 0.8);
            const darkMat = mat('#1f2429', 0.5);
            const lensMat = new THREE.MeshStandardMaterial({ color: '#9fd0e8', roughness: 0.2, transparent: true, opacity: 0.35 });
            const addMesh = (parent, geo, material, x, y, z) => {
              const mesh = new THREE.Mesh(geo, material);
              mesh.position.set(x, y, z);
              mesh.castShadow = true;
              parent.add(mesh);
              return mesh;
            };

            const eng = createWorker('#8aa89a');
            eng.position.set(-4.5, 0.1, 7.7);
            building.add(eng);
            const parts = eng.userData;
            parts.helmet.visible = false;

            addMesh(eng, new THREE.BoxGeometry(0.48, 0.62, 0.3), coatMat, 0, 1.15, 0);
            addMesh(eng, new THREE.BoxGeometry(0.48, 0.3, 0.3), coatMat, 0, 0.78, 0);
            addMesh(eng, new THREE.BoxGeometry(0.1, 0.6, 0.01), mat('#8aa89a'), 0, 1.15, 0.151);
            addMesh(eng, new THREE.BoxGeometry(0.09, 0.06, 0.01), moduleStripeMat, 0.12, 1.3, 0.157);
            [parts.leftArm, parts.rightArm].forEach(arm => {
              addMesh(arm, new THREE.BoxGeometry(0.15, 0.42, 0.15), coatMat, 0, -0.21, 0);
              addMesh(arm, new THREE.BoxGeometry(0.13, 0.2, 0.13), skinMat, 0, -0.5, 0);
              addMesh(arm, new THREE.SphereGeometry(0.07, 8, 6), skinMat, 0, -0.62, 0);
            });

            const hairCap = addMesh(parts.head, new THREE.SphereGeometry(0.162, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), hairMat, 0, 0.01, 0);
            hairCap.rotation.x = -0.6;
            addMesh(parts.head, new THREE.SphereGeometry(0.15, 10, 8), hairMat, 0, -0.01, -0.05);
            addMesh(parts.head, new THREE.SphereGeometry(0.02, 6, 6), skinMat, 0, -0.02, 0.15);
            const eyes = [-0.055, 0.055].map(ex => addMesh(parts.head, new THREE.SphereGeometry(0.018, 8, 6), darkMat, ex, 0.0, 0.138));
            [-0.055, 0.055].forEach(ex => {
              addMesh(parts.head, new THREE.BoxGeometry(0.08, 0.06, 0.008), darkMat, ex, 0.0, 0.146);
              addMesh(parts.head, new THREE.BoxGeometry(0.064, 0.044, 0.01), lensMat, ex, 0.0, 0.151);
              addMesh(parts.head, new THREE.BoxGeometry(0.01, 0.01, 0.14), darkMat, ex * 1.9, 0.0, 0.07);
            });
            const mouth = addMesh(parts.head, new THREE.BoxGeometry(0.05, 0.01, 0.01), mat('#a8525a'), 0, -0.07, 0.143);

            const makeIron = () => {
              const group = new THREE.Group();
              addMesh(group, new THREE.CylinderGeometry(0.018, 0.018, 0.16, 8), darkMat, 0, -0.08, 0);
              addMesh(group, new THREE.CylinderGeometry(0.006, 0.006, 0.1, 6), metalMat, 0, -0.21, 0);
              const tip = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), new THREE.MeshBasicMaterial({ color: '#ff7a1a' }));
              tip.position.y = -0.265;
              group.add(tip);
              return { group, tip };
            };
            const heldIron = makeIron();
            heldIron.group.position.set(0, -0.62, 0);
            heldIron.group.rotation.x = 0.65;
            parts.rightArm.add(heldIron.group);
            const restIron = makeIron();
            restIron.group.position.set(-3.7, 1.1, 8.75);
            restIron.group.rotation.z = -1.2;
            furniture.add(restIron.group);
            addSlab(furniture, 0.07, 0.08, 0.07, metalMat, -3.95, 0.99, 8.75, false);

            addSlab(furniture, 0.8, 0.01, 0.55, mat('#38424a'), -4.3, 0.945, 8.35, false);
            addSlab(furniture, 0.5, 0.03, 0.35, pcbMat, -4.3, 0.97, 8.35, false);
            [[-4.45, 8.28, 0.06, 0.04, '#e8c34a'], [-4.2, 8.42, 0.1, 0.07, '#1f2429'], [-4.4, 8.46, 0.05, 0.05, '#c0504a'], [-4.15, 8.27, 0.05, 0.04, '#5b8fc0']]
              .forEach(([cx, cz, w, d, color]) => addSlab(furniture, w, 0.025, d, mat(color), cx, 0.99, cz, false));
            addSlab(furniture, 0.14, 0.04, 0.24, mat('#d9a441'), -3.85, 0.96, 8.2);
            addSlab(furniture, 0.1, 0.005, 0.07, screenLab, -3.85, 0.985, 8.14, false);

            const lampBulbMat = new THREE.MeshBasicMaterial({ color: '#fff6d8' });
            addMesh(furniture, new THREE.CylinderGeometry(0.08, 0.09, 0.03, 12), darkMat, -4.85, 0.955, 8.8);
            addMesh(furniture, new THREE.CylinderGeometry(0.012, 0.012, 0.5, 6), metalMat, -4.85, 1.22, 8.8);
            const lampArm = addMesh(furniture, new THREE.CylinderGeometry(0.01, 0.01, 0.583, 6), metalMat, -4.6, 1.47, 8.65);
            lampArm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0.5, 0, -0.3).normalize());
            const lampRing = addMesh(furniture, new THREE.TorusGeometry(0.09, 0.012, 6, 16), lampBulbMat, -4.3, 1.46, 8.5);
            lampRing.rotation.x = Math.PI / 2;
            addMesh(furniture, new THREE.CylinderGeometry(0.085, 0.085, 0.005, 16), lensMat, -4.3, 1.46, 8.5);

            const proto = createModuleGroup(1.2);
            const restPos = new THREE.Vector3(-5.4, 1.1, 8.55);
            const heldPos = new THREE.Vector3(-4.5, 1.3, 8.3);
            proto.group.position.copy(restPos);
            furniture.add(proto.group);

            const tipPos = new THREE.Vector3(-4.22, 1.03, 8.4);
            const smokeMat = new THREE.MeshBasicMaterial({ color: '#c9cfd4', transparent: true, opacity: 0.3, depthWrite: false });
            const smoke = Array.from({ length: 5 }, () => {
              const puff = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), smokeMat.clone());
              furniture.add(puff);
              return puff;
            });
            const spark = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), new THREE.MeshBasicMaterial({ color: '#fff2a0' }));
            spark.position.copy(tipPos);
            furniture.add(spark);

            const bubbleCanvas = document.createElement('canvas');
            bubbleCanvas.width = 320;
            bubbleCanvas.height = 100;
            const bubbleCtx = bubbleCanvas.getContext('2d');
            bubbleCtx.fillStyle = '#ffffff';
            bubbleCtx.strokeStyle = BRAND_GREEN;
            bubbleCtx.lineWidth = 8;
            bubbleCtx.beginPath();
            bubbleCtx.roundRect(6, 6, 308, 88, 28);
            bubbleCtx.fill();
            bubbleCtx.stroke();
            bubbleCtx.fillStyle = '#2b323a';
            bubbleCtx.font = 'bold 42px Arial, sans-serif';
            bubbleCtx.textAlign = 'center';
            bubbleCtx.textBaseline = 'middle';
            bubbleCtx.fillText('Protótipo OK!', 160, 52);
            const bubble = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(bubbleCanvas), transparent: true, opacity: 0 }));
            bubble.position.set(0, 2.25, 0);
            eng.add(bubble);

            const ledRed = new THREE.Color('#d9534f');
            const ledGreen = new THREE.Color('#6fbf8a');
            const ledYellow = new THREE.Color('#f0c75e');
            const ss = (a, b, x) => {
              const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
              return k * k * (3 - 2 * k);
            };

            // Ciclo de 16 s: solda, pega o módulo para inspecionar, devolve e comemora
            prototyper.update = (time) => {
              const t = time % 16;
              const hold = ss(7, 8.2, t) - ss(11.5, 12.7, t);
              const party = ss(12.7, 13.3, t) - ss(14.7, 15.5, t);
              const work = Math.max(0, 1 - hold - party);
              const jitter = Math.sin(time * 17) * 0.03 + Math.sin(time * 7.3) * 0.02;

              parts.rightArm.rotation.x = -1.15 * work - 1.2 * hold - 2.7 * party + jitter * work;
              parts.rightArm.rotation.z = party * (0.35 + Math.sin(time * 10) * 0.3);
              parts.leftArm.rotation.x = -0.95 * work - 1.2 * hold - 0.2 * party;
              parts.leftArm.rotation.z = -0.5 * party;
              parts.head.rotation.x = 0.5 * work + (0.25 + Math.sin(time * 2.2) * 0.12) * hold - 0.1 * party;
              parts.head.rotation.y = Math.sin(time * 1.3) * 0.35 * hold + Math.sin(time * 0.9) * 0.1 * work;
              eng.rotation.x = 0.1 * work - 0.04 * hold;
              eng.position.y = 0.1 + Math.abs(Math.sin(time * 9)) * 0.06 * party;

              const blink = time % 4.2 < 0.12 ? 0.1 : 1;
              eyes.forEach(eye => eye.scale.y = blink);
              mouth.scale.set(1 + 0.6 * party, 1 + 1.5 * party, 1);

              proto.group.position.lerpVectors(restPos, heldPos, hold);
              proto.group.position.y += Math.sin(time * 3) * 0.02 * hold;
              proto.group.rotation.y = Math.sin(time * 1.4) * 0.9 * hold;
              proto.group.rotation.x = 0.3 * hold;
              proto.led.material.color.copy(t >= 12 ? ledGreen : hold > 0.3 ? (Math.sin(time * 12) > 0 ? ledYellow : ledRed) : ledRed);

              heldIron.group.visible = work > 0.5;
              restIron.group.visible = !heldIron.group.visible;
              heldIron.tip.scale.setScalar(1 + 0.35 * Math.sin(time * 25));
              spark.visible = work > 0.8 && Math.sin(time * 31) > 0.7;
              smoke.forEach((puff, i) => {
                const u = (time * 0.5 + i / smoke.length) % 1;
                puff.position.set(tipPos.x + Math.sin(time * 2 + i * 2) * 0.04 * u, tipPos.y + 0.03 + u * 0.45, tipPos.z + 0.02 * u);
                puff.scale.setScalar(0.02 + u * 0.07);
                puff.material.opacity = (1 - u) * 0.35 * work;
              });

              bubble.material.opacity = party;
              bubble.scale.set(0.9 * party + 0.001, 0.28 * party + 0.001, 1);
            };
          };
          buildPrototyper();
