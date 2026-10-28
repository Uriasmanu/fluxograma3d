          const GREEN = '#2f9e5e';
          const V = (x, y, z) => new THREE.Vector3(x, y, z);
          const stdMat = (color, roughness = 0.6) => new THREE.MeshStandardMaterial({ color, roughness });
          const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
          const addMesh = (parent, geo, material, x, y, z, shadow = true) => {
            const mesh = new THREE.Mesh(geo, material);
            mesh.position.set(x, y, z);
            mesh.castShadow = shadow;
            mesh.receiveShadow = true;
            parent.add(mesh);
            return mesh;
          };
          const ss = (a, b, x) => {
            const q = Math.min(1, Math.max(0, (x - a) / (b - a)));
            return q * q * (3 - 2 * q);
          };
          const win = (a, b, c, d, x) => ss(a, b, x) - ss(c, d, x);
          const lerpAngle = (a, b, q) => a + (((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI) * q;
          const DOWN = V(0, -1, 0);
          const tmpDir = V(0, 0, 0);
          const tmpPole = V(0, 0, 0);
          const ik = { mid: V(0, 0, 0), end: V(0, 0, 0), err: 0 };
          const solve = (root, target, a, b, pole) => {
            tmpDir.subVectors(target, root);
            const d = tmpDir.length();
            const reach = Math.min(a + b - 0.002, Math.max(Math.abs(a - b) + 0.02, d));
            tmpDir.normalize();
            const x = (a * a - b * b + reach * reach) / (2 * reach);
            const h = Math.sqrt(Math.max(0, a * a - x * x));
            tmpPole.copy(pole).addScaledVector(tmpDir, -pole.dot(tmpDir)).normalize();
            ik.mid.copy(root).addScaledVector(tmpDir, x).addScaledVector(tmpPole, h);
            ik.end.copy(root).addScaledVector(tmpDir, reach);
            ik.err = Math.abs(d - reach);
          };
          const aim = (group, from, to) => {
            group.position.copy(from);
            tmpDir.subVectors(to, from).normalize();
            group.quaternion.setFromUnitVectors(DOWN, tmpDir);
          };
          const leanPoint = (out, x, y, z, lean) => out.set(x, y * Math.cos(lean) - z * Math.sin(lean), y * Math.sin(lean) + z * Math.cos(lean));
          const canvasOf = (w, h) => {
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            return canvas;
          };
