          // ---------- arcos elétricos nas buchas ----------
          const arcs = [[-0.8, 0], [0, 0.8]].map(([x0, x1]) => {
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(14 * 3), 3));
            const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#cfe8ff', transparent: true, blending: THREE.AdditiveBlending }));
            line.visible = false;
            line.frustumCulled = false;
            root.add(line);
            return { line, x0, x1 };
          });
          const updateArcs = (p) => arcs.forEach(arc => {
            arc.line.visible = Math.random() < 0.25 + p * 0.6;
            if (!arc.line.visible) return;
            const pos = arc.line.geometry.attributes.position.array;
            for (let i = 0; i < 14; i++) {
              const q = i / 13;
              pos[i * 3] = arc.x0 + (arc.x1 - arc.x0) * q + (i > 0 && i < 13 ? rnd(-0.12, 0.12) : 0);
              pos[i * 3 + 1] = 3.98 + Math.sin(q * Math.PI) * 0.25 + (i > 0 && i < 13 ? rnd(-0.1, 0.1) : 0);
              pos[i * 3 + 2] = 0.4 + (i > 0 && i < 13 ? rnd(-0.1, 0.1) : 0);
            }
            arc.line.geometry.attributes.position.needsUpdate = true;
          });
