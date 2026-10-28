          // ---------- Canto do café: cafeteira de coador na parede norte ----------
          const buildCoffeeCorner = () => {
            const tx = -1.6;
            const tz = -3.98;
            addMesh(furniture, box(0.9, 0.04, 0.45), deskMat, tx, 0.78, tz);
            [-0.4, 0.4].forEach(ox => [-0.19, 0.19].forEach(oz => addMesh(furniture, box(0.04, 0.76, 0.04), deskMat, tx + ox, 0.38, tz + oz)));
            aabb('mesa-cafe', tx, 0.78, tz, 0.9, 0.04, 0.45);
            [-0.4, 0.4].forEach(ox => [-0.19, 0.19].forEach(oz => aabb('perna-mesa-cafe', tx + ox, 0.38, tz + oz, 0.04, 0.76, 0.04)));
            const darkPlastic = stdMat('#1f2429', 0.4);
            addMesh(furniture, box(0.3, 0.04, 0.26), darkPlastic, tx, 0.82, tz - 0.05);
            addMesh(furniture, box(0.26, 0.42, 0.1), darkPlastic, tx, 1.03, tz - 0.15);
            addMesh(furniture, box(0.26, 0.08, 0.24), darkPlastic, tx, 1.18, tz - 0.07);
            aabb('cafeteira-base', tx, 0.82, tz - 0.05, 0.3, 0.04, 0.26);
            aabb('cafeteira-coluna', tx, 1.03, tz - 0.15, 0.26, 0.42, 0.1);
            aabb('cafeteira-topo', tx, 1.18, tz - 0.07, 0.26, 0.08, 0.24);
            const led = addMesh(furniture, new THREE.SphereGeometry(0.014, 8, 6), new THREE.MeshBasicMaterial({ color: '#ff3a2a' }), tx + 0.08, 1.06, tz - 0.098, false);
            const glassMat2 = new THREE.MeshStandardMaterial({ color: '#cfe4ee', roughness: 0.1, transparent: true, opacity: 0.35, depthWrite: false });
            const carafe = new THREE.Group();
            addMesh(carafe, new THREE.CylinderGeometry(0.058, 0.064, 0.16, 12), glassMat2, 0, 0, 0, false);
            const brew = addMesh(carafe, new THREE.CylinderGeometry(0.054, 0.06, 0.1, 12), stdMat('#3b2416', 0.3), 0, -0.03, 0, false);
            addMesh(carafe, new THREE.CylinderGeometry(0.062, 0.062, 0.02, 12), darkPlastic, 0, 0.09, 0, false);
            addMesh(carafe, box(0.02, 0.1, 0.02), darkPlastic, 0.075, 0.02, 0, false);
            addMesh(carafe, box(0.03, 0.02, 0.04), darkPlastic, 0, 0.075, 0.06, false);
            furniture.add(carafe);
            const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1, 6), new THREE.MeshBasicMaterial({ color: '#4b2e1e' }));
            stream.visible = false;
            furniture.add(stream);
            const steamPuffs = [0, 1, 2].map(() => {
              const puff = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 5), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.3, depthWrite: false }));
              furniture.add(puff);
              return puff;
            });
            const corner = {
              stand: { x: tx, z: -3.5 },
              carafeRest: V(tx, 0.92, tz - 0.01),
              mugTable: V(tx, 0.845, -3.8),
              carafePos: V(tx, 0.92, tz - 0.01),
              tilt: 0,
              level: 1,
              streamFrom: V(0, 0, 0),
              streamTo: V(0, 0, 0),
              streamOn: false
            };
            const up = V(0, 1, 0);
            const dir = V(0, 0, 0);
            officeLife.tickers.push((time) => {
              carafe.position.copy(corner.carafePos);
              carafe.rotation.x = corner.tilt;
              brew.scale.y = Math.max(0.05, corner.level);
              brew.position.y = -0.08 + 0.05 * corner.level;
              led.material.color.set(Math.floor(time * 2) % 2 === 0 ? '#2fdf6a' : '#1a8a40');
              stream.visible = corner.streamOn;
              if (corner.streamOn) {
                dir.subVectors(corner.streamTo, corner.streamFrom);
                const len = Math.max(0.01, dir.length());
                stream.position.addVectors(corner.streamFrom, corner.streamTo).multiplyScalar(0.5);
                stream.scale.set(1, len, 1);
                stream.quaternion.setFromUnitVectors(up, dir.normalize());
              }
              steamPuffs.forEach((puff, i) => {
                const q = (time * 0.5 + i / 3) % 1;
                puff.visible = corner.level > 0.3;
                puff.position.set(corner.carafePos.x + Math.sin(time * 2 + i) * 0.01, corner.carafePos.y + 0.12 + q * 0.2, corner.carafePos.z);
                puff.scale.setScalar(0.015 + q * 0.03);
                puff.material.opacity = (1 - q) * 0.3;
              });
            });
            return corner;
          };
