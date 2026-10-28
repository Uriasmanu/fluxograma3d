        // Antenas da rede (TCP/IP): uma na subestação e outra no pátio da Treetech
        const createMast = (x, y, z, height) => {
          const group = new THREE.Group();
          group.position.set(x, y, z);
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, height, 8), streetPoleMat);
          pole.position.y = height / 2;
          pole.castShadow = true;
          group.add(pole);
          const dish = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), moduleBodyMat);
          dish.position.set(0, height - 0.2, 0.1);
          dish.rotation.x = Math.PI / 2;
          group.add(dish);
          const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: BRAND_GREEN }));
          beacon.position.y = height + 0.25;
          group.add(beacon);
          scene.add(group);
          return { group, top: new THREE.Vector3(x, y + height + 0.25, z) };
        };
        const mastSub = createMast(2.8, 0.345, 5.3, 5.5);
        const mastTt = createMast(60.8, 0.3, 7.5, 6.0);

        // Bancos de dados: PostgreSQL e SQL Server, lado a lado, ao lado da fila do RabbitMQ
        const DB_NAMES = ['PostgreSQL', 'SQL Server'];
        const dbNodes = DB_NAMES.map((name, i) => {
          const dbZ = 2.6 + i * 1.9;
          const group = new THREE.Group();
          group.position.set(60.9, 0.3, dbZ);
          const dbMat = new THREE.MeshStandardMaterial({ color: '#cfd6dc', roughness: 0.5 });
          addSlab(group, 1.3, 0.12, 1.3, moduleBodyMat, 0, 0.06, 0);
          for (let d = 0; d < 3; d++) {
            const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.28, 24), dbMat);
            disc.position.y = 0.32 + d * 0.36;
            disc.castShadow = true;
            group.add(disc);
          }
          scene.add(group);
          addLabel(`db${i + 1}`, name, 60.9, 2.5, dbZ, 1.8);
          return { name, group, mat: dbMat, top: new THREE.Vector3(60.9, 1.5, dbZ) };
        });
