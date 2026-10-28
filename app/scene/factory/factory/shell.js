          const mat = (color, roughness = 0.6) => new THREE.MeshStandardMaterial({ color, roughness });
          const wallMat = mat('#cfd6dc');
          const roofMat = mat('#6b7d73');
          const doorMat = mat('#5a6772');
          const glassMat = mat('#7f98aa', 0.3);
          duskWindowMats.push(glassMat);
          const crateMat = mat('#c9b89a');

          addSlab(factoryWorld, 16, 0.6, 16, mat('#c9ccce', 0.8), 0, -0.3, 0, false);
          addSlab(factoryWorld, 16.6, 0.1, 16.6, mat('#7aa58a', 0.8), 0, -0.06, 0, false);

          const building = new THREE.Group();
          factoryWorld.add(building);
          addSlab(building, 14, 0.1, 8, mat('#d8d6d0', 0.8), 0, 0.05, 0, false);

          const wallH = 4.2;
          const walls = new THREE.Group();
          walls.position.y = 0.1;
          addSlab(walls, 14, wallH, 0.25, wallMat, 0, wallH / 2, -3.875);
          addSlab(walls, 14, wallH, 0.25, wallMat, 0, wallH / 2, 3.875);
          addSlab(walls, 0.25, wallH, 7.5, wallMat, -6.875, wallH / 2, 0);
          addSlab(walls, 0.25, wallH, 7.5, wallMat, 6.875, wallH / 2, 0);
          addSlab(walls, 14.02, 0.4, 0.27, moduleStripeMat, 0, 0.5, -3.875, false);
          addSlab(walls, 14.02, 0.4, 0.27, moduleStripeMat, 0, 0.5, 3.875, false);

          const gableShape = new THREE.Shape([new THREE.Vector2(-4.1, 0), new THREE.Vector2(4.1, 0), new THREE.Vector2(0, 2.2)]);
          const gableGeo = new THREE.ExtrudeGeometry(gableShape, { depth: 0.25, bevelEnabled: false });
          gableGeo.rotateY(Math.PI / 2);
          [6.75, -7.0].forEach(gx => {
            const gable = new THREE.Mesh(gableGeo, wallMat);
            gable.position.set(gx, wallH, 0);
            gable.castShadow = true;
            walls.add(gable);
          });

          addSlab(walls, 3.6, 3.4, 0.08, doorMat, 0, 1.7, -4.04, false);
          addSlab(walls, 1.2, 2.2, 0.06, doorMat, 0, 1.1, 4.03, false);

          const signCanvas = document.createElement('canvas');
          signCanvas.width = 1024;
          signCanvas.height = 160;
          const signCtx = signCanvas.getContext('2d');
          signCtx.fillStyle = '#f4f7f5';
          signCtx.fillRect(0, 0, 1024, 160);
          signCtx.fillStyle = BRAND_GREEN;
          signCtx.fillRect(0, 0, 18, 160);
          signCtx.font = 'bold 84px Arial, sans-serif';
          signCtx.textBaseline = 'middle';
          signCtx.fillText('Treetech', 50, 82);
          signCtx.fillStyle = '#5a6772';
          signCtx.font = '48px Arial, sans-serif';
          signCtx.fillText('Fábrica de módulos', 450, 86);
          const factorySign = new THREE.Mesh(
            new THREE.PlaneGeometry(6, 0.94),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(signCanvas) })
          );
          factorySign.position.set(0, 3.75, -4.06);
          factorySign.rotation.y = Math.PI;
          walls.add(factorySign);
          building.add(walls);

          const roof = new THREE.Group();
          const slope = Math.atan2(2.2, 4.2);
          [-1, 1].forEach(side => {
            const panel = addSlab(roof, 14.8, 0.18, 5.15, roofMat, 0, 0.1 + wallH + 1.15, side * 2.1);
            panel.rotation.x = side * slope;
          });
          addSlab(roof, 14.8, 0.16, 0.3, roofMat, 0, 0.1 + wallH + 2.3, 0);
          building.add(roof);
