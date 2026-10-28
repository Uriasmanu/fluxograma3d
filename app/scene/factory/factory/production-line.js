          // Interior: esteira com módulos, três funcionários na montagem e um supervisor andando
          const furniture = new THREE.Group();
          furniture.position.y = 0.1;
          building.add(furniture);

          const metalMat = mat('#8a949e', 0.5);
          addSlab(furniture, 9.4, 0.1, 0.9, mat('#5a6772', 0.7), 0, 0.85, 0);
          addSlab(furniture, 9.4, 0.08, 0.06, metalMat, 0, 0.97, -0.46, false);
          addSlab(furniture, 9.4, 0.08, 0.06, metalMat, 0, 0.97, 0.46, false);
          [-4.3, -1.4, 1.4, 4.3].forEach(lx => addSlab(furniture, 0.12, 0.8, 0.8, metalMat, lx, 0.4, 0));

          for (let i = 0; i < 7; i++) {
            const { group } = createModuleGroup(1.4);
            group.position.set(-4.7 + i * 1.3, 1.08, 0);
            furniture.add(group);
            factoryBelt.push(group);
          }

          [-3, 0, 3].forEach((wx, i) => {
            const worker = createWorker(['#7fa88c', '#9db8a4', '#6f9a82'][i]);
            worker.position.set(wx, 0.1, 1.15);
            worker.rotation.y = Math.PI;
            worker.userData.leftLeg.rotation.x = 0;
            building.add(worker);
            factoryWorkers.push({ group: worker, phase: i * 1.7 });
          });

          const supervisor = createWorker('#9aa7b8');
          supervisor.position.set(-5.5, 0.1, -2.6);
          building.add(supervisor);
          factoryWalker.group = supervisor;
          factoryWalker.path = makePath([[-5.5, -2.6], [5.5, -2.6]], 'pingpong');

          [[-6.0, 0.35, 2.8], [-5.2, 0.35, 2.8], [-5.6, 0.95, 2.8], [6.0, 0.35, -2.6], [5.2, 0.35, -2.6]].forEach(([cx, cy, cz]) => {
            addSlab(furniture, 0.7, 0.55, 0.7, crateMat, cx, cy, cz);
          });

          [[-5.4, 0.3, -5.5], [-4.5, 0.3, -5.5], [-5.0, 0.9, -5.5], [5.4, 0.3, -5.5]].forEach(([cx, cy, cz]) => {
            addSlab(factoryWorld, 0.8, 0.6, 0.8, crateMat, cx, cy, cz);
          });
