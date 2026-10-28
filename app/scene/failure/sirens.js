          // ---------- sirenes giratórias ----------
          const beacons = [];
          const makeBeacon = (parent, x, y, z) => {
            const g = new THREE.Group();
            g.position.set(x, y, z);
            g.visible = false;
            parent.add(g);
            const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.18, 10), new THREE.MeshStandardMaterial({ color: '#2b323a', roughness: 0.5 }));
            g.add(base);
            const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ff2a2a' }));
            lamp.position.y = 0.09;
            g.add(lamp);
            const spin = new THREE.Group();
            spin.position.y = 0.2;
            g.add(spin);
            [1, -1].forEach(dir => {
              const beam = new THREE.Mesh(new THREE.ConeGeometry(0.55, 4.5, 12, 1, true), new THREE.MeshBasicMaterial({ color: '#ff2020', transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
              beam.rotation.z = (-Math.PI / 2) * dir;
              beam.position.x = 2.25 * dir;
              spin.add(beam);
            });
            const beacon = { g, spin, lamp };
            beacons.push(beacon);
            return beacon;
          };
          [[3, 8.1, -4.5], [-3, 8.1, -4.5]].forEach(([x, y, z]) => makeBeacon(root, x, y, z));
          [[6.9, 3.5, 6.9], [-6.9, 3.5, 6.9]].forEach(([x, y, z]) => {
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.1, 6), new THREE.MeshStandardMaterial({ color: '#8a949e', roughness: 0.5 }));
            pole.position.set(x, 1.9, z);
            root.add(pole);
            makeBeacon(root, x, y + 0.1, z);
          });
          [[4.4, 4.45, -3.8], [-4.4, 4.45, -3.8], [-9.6, 4.45, -3.8]].forEach(([x, y, z]) => makeBeacon(treetechWorld, x, y, z));
          const alarmLight = new THREE.PointLight(0xff2a10, 0, 32, 2);
          alarmLight.position.set(0, 5, 2);
          scene.add(alarmLight);
          const blastLight = new THREE.PointLight(0xffa040, 0, 70, 1.5);
          blastLight.position.set(0, 4, 0);
          scene.add(blastLight);
