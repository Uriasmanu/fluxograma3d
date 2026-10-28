          // ---------- explosão ----------
          const fireballs = [
            { mesh: new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: '#d63a10', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })), r: 8.5, delay: 0 },
            { mesh: new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: '#ff9a30', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })), r: 6.2, delay: 0.03 },
            { mesh: new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: '#fff1c0', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })), r: 3.6, delay: 0.06 }
          ];
          fireballs.forEach(f => {
            f.mesh.visible = false;
            f.mesh.position.set(0, 2.2, 0);
            root.add(f.mesh);
          });
          const ring = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 64), new THREE.MeshBasicMaterial({ color: '#ffd9a0', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }));
          ring.rotation.x = -Math.PI / 2;
          ring.position.y = 0.5;
          ring.visible = false;
          root.add(ring);
          const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#fff4e0', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }));
          dome.visible = false;
          root.add(dome);

          const debris = [];
          const debrisMats = ['#3a4048', '#1a1a1a', '#7a3a22', '#566068', '#c9b273'].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 }));
          const concreteMat = new THREE.MeshStandardMaterial({ color: '#9ca6b0', roughness: 0.8 });
          for (let i = 0; i < 110; i++) {
            const kind = i % 4;
            const geo = kind === 0 ? new THREE.BoxGeometry(rnd(0.15, 0.7), rnd(0.1, 0.5), rnd(0.15, 0.7))
              : kind === 1 ? new THREE.CylinderGeometry(rnd(0.06, 0.16), rnd(0.06, 0.16), rnd(0.4, 1.2), 6)
                : kind === 2 ? new THREE.BoxGeometry(rnd(0.5, 1.2), 0.08, rnd(0.4, 0.9)) : new THREE.BoxGeometry(0.12, 0.12, 0.12);
            const mesh = new THREE.Mesh(geo, i >= 70 ? concreteMat : debrisMats[i % debrisMats.length]);
            mesh.castShadow = true;
            mesh.visible = false;
            root.add(mesh);
            debris.push({ mesh, vel: V3(0, 0, 0), ang: V3(0, 0, 0), rest: true });
          }
          const launch = (p, x, y, z, speed, up) => {
            const a = Math.random() * Math.PI * 2;
            const h = speed * rnd(0.4, 1);
            p.mesh.position.set(x, y, z);
            p.mesh.scale.setScalar(1);
            p.vel.set(Math.cos(a) * h, up * rnd(0.5, 1), Math.sin(a) * h);
            p.ang.set(rnd(-8, 8), rnd(-8, 8), rnd(-8, 8));
            p.rest = false;
            p.mesh.visible = true;
          };
          const stepDebris = (dt) => debris.forEach(p => {
            if (p.rest || !p.mesh.visible) return;
            p.vel.y -= 24 * dt;
            p.mesh.position.addScaledVector(p.vel, dt);
            p.mesh.rotation.x += p.ang.x * dt;
            p.mesh.rotation.y += p.ang.y * dt;
            p.mesh.rotation.z += p.ang.z * dt;
            if (p.mesh.position.y < 0.45) {
              p.mesh.position.y = 0.45;
              if (Math.abs(p.vel.y) > 2) p.vel.y *= -0.35;
              else p.vel.y = 0;
              p.vel.x *= 0.7;
              p.vel.z *= 0.7;
              p.ang.multiplyScalar(0.6);
              if (Math.hypot(p.vel.x, p.vel.z) < 0.3 && p.vel.y === 0) p.rest = true;
            }
          });
