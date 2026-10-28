        // Cidade viva: carros na avenida e moradores nas calçadas
        const cityCars = [];
        const cityPeople = [];
        const buildCityLife = () => {
          const wheelMat = new THREE.MeshStandardMaterial({ color: '#2b323a', roughness: 0.8 });
          const glassMat = new THREE.MeshStandardMaterial({ color: '#7f98aa', roughness: 0.3 });
          const carPath = makePath([[-8, 1.2], [24, 1.2], [24, -1.2], [-8, -1.2]], 'loop');
          [['#a8606c', 0, 3.2], ['#5f8aa5', 23, 2.6], ['#c9b87a', 46, 3.6]].forEach(([color, offset, speed]) => {
            const car = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.45 });
            addSlab(car, 0.9, 0.35, 1.9, bodyMat, 0, 0.38, 0);
            addSlab(car, 0.8, 0.3, 1.0, bodyMat, 0, 0.7, -0.1);
            addSlab(car, 0.82, 0.2, 0.9, glassMat, 0, 0.72, -0.1, false);
            [[-0.45, 0.6], [0.45, 0.6], [-0.45, -0.6], [0.45, -0.6]].forEach(([wx, wz]) => {
              const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 12), wheelMat);
              wheel.rotation.z = Math.PI / 2;
              wheel.position.set(wx, 0.2, wz);
              car.add(wheel);
            });
            addVehicleLights(car, 0.96, -0.96, 0.42, 0.3);
            cityWorld.add(car);
            cityCars.push({ group: car, path: carPath, speed, offset });
          });

          [
            ['#c8a07a', [[-7, 3.8], [22, 3.8]], 0.9, 0],
            ['#8aa0c0', [[22, -3.8], [-7, -3.8]], 1.1, 12],
            ['#b88a9a', [[-7, 3.8], [22, 3.8]], 0.8, 40],
            ['#9ab88a', [[22, -3.8], [-7, -3.8]], 1.0, 33]
          ].forEach(([color, points, speed, offset]) => {
            const person = createWorker(color);
            person.userData.helmet.visible = false;
            person.scale.setScalar(0.7);
            cityWorld.add(person);
            cityPeople.push({ group: person, path: makePath(points, 'pingpong'), speed, offset });
          });
        };
        buildCityLife();

        // Trânsito e pedestres perto da subestação: podem ser atingidos pela explosão
        const nearby = [];
        const buildNearby = () => {
          const wheelMat = new THREE.MeshStandardMaterial({ color: '#2b323a', roughness: 0.8 });
          const glassMat = new THREE.MeshStandardMaterial({ color: '#7f98aa', roughness: 0.3 });
          const makeCar = (color) => {
            const car = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.45 });
            addSlab(car, 0.9, 0.35, 1.9, bodyMat, 0, 0.38, 0);
            addSlab(car, 0.8, 0.3, 1.0, bodyMat, 0, 0.7, -0.1);
            addSlab(car, 0.82, 0.2, 0.9, glassMat, 0, 0.72, -0.1, false);
            [[-0.45, 0.6], [0.45, 0.6], [-0.45, -0.6], [0.45, -0.6]].forEach(([wx, wz]) => {
              const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 12), wheelMat);
              wheel.rotation.z = Math.PI / 2;
              wheel.position.set(wx, 0.2, wz);
              car.add(wheel);
            });
            addVehicleLights(car, 0.96, -0.96, 0.42, 0.3);
            scene.add(car);
            return car;
          };
          const driving = makeCar('#c9b87a');
          nearby.push({ group: driving, path: makePath([[-4, 19.0], [-4, 11.0]], 'pingpong'), speed: 1.6, offset: 0, y: 0.06 });
          const parked = makeCar('#a8606c');
          parked.position.set(-8.2, 0.03, 15);
          parked.userData.parked = true;
          nearby.push({ group: parked, fixed: true });
          [{ color: '#c8a07a', pts: [[9.2, -5], [9.2, 5]], speed: 0.9, offset: 0 }, { color: '#8aa0c0', pts: [[-2, 9.2], [8, 9.2]], speed: 0.8, offset: 6 }].forEach(def => {
            const person = createWorker(def.color);
            person.userData.helmet.visible = false;
            scene.add(person);
            nearby.push({ group: person, path: makePath(def.pts, 'pingpong'), speed: def.speed, offset: def.offset, y: 0.02, walker: true });
          });
        };
        buildNearby();

        const updateWorld = (time) => {
          nearby.forEach(e => {
            if (e.hit || e.fixed) return;
            const travelled = time * e.speed + e.offset;
            const sm = samplePath(e.path, travelled);
            e.group.position.set(sm.x, e.y, sm.z);
            e.group.rotation.y = sm.heading;
            if (e.walker) {
              const swing = Math.sin(travelled * 5) * 0.7;
              const parts = e.group.userData;
              parts.leftLeg.rotation.x = swing;
              parts.rightLeg.rotation.x = -swing;
              parts.leftArm.rotation.x = -swing * 0.8;
              parts.rightArm.rotation.x = swing * 0.8;
            }
          });

          cityCars.forEach(car => {
            if (car.hit) return;
            const s = samplePath(car.path, time * car.speed + car.offset);
            car.group.position.set(s.x, 0.03, s.z);
            car.group.rotation.y = s.heading;
          });

          cityPeople.forEach(person => {
            if (person.hit) return;
            const travelled = time * person.speed + person.offset;
            const s = samplePath(person.path, travelled);
            person.group.position.set(s.x, 0.02, s.z);
            person.group.rotation.y = s.heading;
            const swing = Math.sin(travelled * 5) * 0.7;
            const parts = person.group.userData;
            parts.leftLeg.rotation.x = swing;
            parts.rightLeg.rotation.x = -swing;
            parts.leftArm.rotation.x = -swing * 0.8;
            parts.rightArm.rotation.x = swing * 0.8;
          });

          vans.forEach(van => {
            if (van.hit) return;
            const travelled = time * van.speed + van.offset;
            const s = samplePath(van.path, travelled);
            van.group.position.set(s.x, 0.06, s.z);
            van.group.rotation.y = s.heading;
            const along = ((travelled % van.path.total) + van.path.total) % van.path.total;
            van.crate.visible = along < van.deliveredAt;
          });

          factoryBelt.forEach((module, i) => {
            module.position.x = ((time * 0.6 + i * 1.3) % 9.1) - 4.55;
          });

          if (prototyper.update) prototyper.update(time);
          if (officeLife.update) officeLife.update(time);
          if (homeLife.update) homeLife.update(time);
          if (installer.update) installer.update(time);

          factoryWorkers.forEach(worker => {
            const t = time + worker.phase;
            const parts = worker.group.userData;
            parts.leftArm.rotation.x = -0.9 + Math.sin(t * 3) * 0.25;
            parts.rightArm.rotation.x = -0.9 + Math.sin(t * 3 + 1.2) * 0.25;
          });

          if (factoryWalker.group) {
            const travelled = time * 0.8;
            const s = samplePath(factoryWalker.path, travelled);
            factoryWalker.group.position.set(s.x, 0.1, s.z);
            factoryWalker.group.rotation.y = s.heading;
            const swing = Math.sin(travelled * 4.5) * 0.7;
            const parts = factoryWalker.group.userData;
            parts.leftLeg.rotation.x = swing;
            parts.rightLeg.rotation.x = -swing;
            parts.leftArm.rotation.x = -swing * 0.8;
            parts.rightArm.rotation.x = swing * 0.8;
          }
        };

        addLabel('factory', 'Fábrica de módulos', 54, 9.2, 33, 5.2);
        addLabel('treetech', 'Treetech: RabbitMQ, Sigma e banco', 54, 13.6, 8, 6.6);        addLabel('substation', 'Subestação (módulos instalados)', 0, 9.5, 0, 6.4);
        addLabel('vans', 'Vans levam os módulos', 28, 3.6, 19.5, 4.6);
        addLabel('plant', 'Usuários do Sigma (PCs)', 20.3, 9.5, -1.5, 5.2);
        addLabel('sigma', 'Sigma ECM', 52, 16.6, 5.8, 2.0);
        addLabel('rabbit', 'RabbitMQ', 58, 3.4, 3.4, 1.7);
        addLabel('mast', 'Rede TCP/IP', 2.8, 7.4, 5.3, 2.4);
        setLabels(null);
