        // Vans da Treetech: saem da fábrica carregadas, vão até o portão da subestação e voltam vazias
        const vans = [];
        const buildVans = () => {
          const path = makePath(
            [[54, 23.0], [54, 18.5], [-3.2, 18.5], [-3.2, 9.8], [-4.8, 9.8], [-4.8, 20.5], [54, 20.5]],
            'loop'
          );
          const deliveredAt = path.segs[3].start + path.segs[3].len;
          const bodyMat = new THREE.MeshStandardMaterial({ color: '#e8ecef', roughness: 0.5 });
          const wheelMat = new THREE.MeshStandardMaterial({ color: '#2b323a', roughness: 0.8 });
          const glass = new THREE.MeshStandardMaterial({ color: '#7f98aa', roughness: 0.3 });
          const crateMat = new THREE.MeshStandardMaterial({ color: '#c9b89a', roughness: 0.7 });

          [0, path.total / 2].forEach(offset => {
            const group = new THREE.Group();
            addSlab(group, 1.0, 0.8, 2.0, bodyMat, 0, 0.62, -0.15);
            addSlab(group, 0.95, 0.6, 0.75, bodyMat, 0, 0.52, 1.0);
            addSlab(group, 0.96, 0.18, 0.5, glass, 0, 0.8, 1.05, false);
            addSlab(group, 1.02, 0.14, 2.1, moduleStripeMat, 0, 0.5, -0.1, false);
            addVehicleLights(group, 1.4, -1.17, 0.5, 0.3);
            [[-0.5, 0.7], [0.5, 0.7], [-0.5, -0.7], [0.5, -0.7]].forEach(([wx, wz]) => {
              const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.16, 12), wheelMat);
              wheel.rotation.z = Math.PI / 2;
              wheel.position.set(wx, 0.22, wz);
              group.add(wheel);
            });
            const crate = new THREE.Group();
            addSlab(crate, 0.8, 0.5, 0.9, crateMat, 0, 1.27, -0.3);
            addSlab(crate, 0.82, 0.08, 0.92, moduleStripeMat, 0, 1.3, -0.3, false);
            group.add(crate);
            scene.add(group);
            vans.push({ group, crate, path, speed: 4.5, offset, deliveredAt });
          });
        };
        buildVans();
