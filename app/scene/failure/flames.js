          // ---------- chamas ----------
          const flameGeo = new THREE.ConeGeometry(0.35, 1.2, 7);
          const fires = [];
          const makeFire = (parent, x, y, z, size) => {
            const group = new THREE.Group();
            group.position.set(x, y, z);
            group.visible = false;
            parent.add(group);
            const cones = [0, 1, 2].map(i => {
              const cone = new THREE.Mesh(flameGeo, new THREE.MeshBasicMaterial({ color: i === 0 ? '#ff6a1a' : (i === 1 ? '#ffa030' : '#ffe08a'), transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
              cone.position.set((i - 1) * 0.18 * size, 0.55 * size * (1 - i * 0.2), (i % 2) * 0.15 * size);
              group.add(cone);
              return cone;
            });
            const fire = { group, cones, size, phase: Math.random() * 10, amount: 1 };
            fires.push(fire);
            return fire;
          };
          const updateFires = (time) => fires.forEach(f => {
            if (!f.group.visible) return;
            f.cones.forEach((cone, i) => {
              const k = 1 + 0.28 * Math.sin(time * (9 + i * 3) + f.phase + i);
              const base = f.size * (1 - i * 0.25) * f.amount;
              cone.scale.set(base * (0.9 + 0.2 * Math.sin(time * 7 + i)), base * k, base);
            });
          });
