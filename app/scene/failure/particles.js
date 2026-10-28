          // ---------- partículas ----------
          const makePool = (n, geo, matFactory) => Array.from({ length: n }, () => {
            const mesh = new THREE.Mesh(geo, matFactory());
            mesh.visible = false;
            root.add(mesh);
            return { mesh, life: 0, max: 1, vel: V3(0, 0, 0), grow: 0, op: 0, s0: 1 };
          });
          const sphereGeo = new THREE.SphereGeometry(1, 8, 6);
          const smokePool = makePool(90, sphereGeo, () => new THREE.MeshBasicMaterial({ color: '#2a2a2a', transparent: true, opacity: 0, depthWrite: false }));
          const dustPool = makePool(70, sphereGeo, () => new THREE.MeshBasicMaterial({ color: '#b9b2a6', transparent: true, opacity: 0, depthWrite: false }));
          const sparkPool = makePool(70, new THREE.SphereGeometry(0.06, 5, 4), () => new THREE.MeshBasicMaterial({ color: '#ffd27a', transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false }));
          const emit = (pool, x, y, z, vx, vy, vz, life, s0, grow, op) => {
            const p = pool.find(q => q.life <= 0);
            if (!p) return null;
            p.life = life;
            p.max = life;
            p.mesh.position.set(x, y, z);
            p.vel.set(vx, vy, vz);
            p.s0 = s0;
            p.grow = grow;
            p.op = op;
            p.mesh.scale.setScalar(s0);
            p.mesh.visible = true;
            return p;
          };
          const stepPool = (pool, dt, gravity) => pool.forEach(p => {
            if (p.life <= 0) return;
            p.life -= dt;
            if (p.life <= 0) {
              p.mesh.visible = false;
              return;
            }
            p.mesh.position.addScaledVector(p.vel, dt);
            p.vel.y += gravity * dt;
            const q = 1 - p.life / p.max;
            p.mesh.scale.setScalar(p.s0 + p.grow * q);
            p.mesh.material.opacity = p.op * (1 - q * q);
          });
