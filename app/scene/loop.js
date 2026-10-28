        // LOOP DE ANIMAÇÃO 3D
        let animationFrameId;
        const clock = new THREE.Clock();

        const animate = () => {
          animationFrameId = requestAnimationFrame(animate);
          const time = clock.getElapsedTime();

          controls.update();
          failureCtl.update(time);

          // Animação de partículas de energia fluindo pelos cabos
          particleSystemsRef.current.forEach(p => {
            const { curve, speed } = p.userData;
            p.userData.progress = (p.userData.progress + speed) % 1;
            const posArr = p.geometry.attributes.position.array;

            for (let i = 0; i < 5; i++) {
              const t = (p.userData.progress + i * 0.18) % 1;
              const pt = curve.getPoint(t);
              posArr[i * 3] = pt.x;
              posArr[i * 3 + 1] = pt.y;
              posArr[i * 3 + 2] = pt.z;
            }
            p.geometry.attributes.position.needsUpdate = true;
          });

          // Escritório da usina: pessoas sentadas digitando, uma pessoa andando e o telhado abrindo
          plantSeated.forEach(s => {
            const t = time + s.phase;
            const parts = s.worker.userData;
            parts.leftArm.rotation.x = -1.0 + Math.sin(t * 9) * 0.08;
            parts.rightArm.rotation.x = -1.0 + Math.sin(t * 9 + 1.3) * 0.08;
            parts.head.rotation.x = Math.sin(t * 0.7) * 0.08;
          });
          [plantOfficeWalker, treetechWalker].forEach(officeWalker => {
            if (!officeWalker.group) return;
            const travelled = time * 0.8;
            const s = samplePath(officeWalker.path, travelled);
            officeWalker.group.position.set(s.x, 0.1, s.z);
            officeWalker.group.rotation.y = s.heading;

            const swing = Math.sin(travelled * 4.5) * 0.7;
            const parts = officeWalker.group.userData;
            parts.leftLeg.rotation.x = swing;
            parts.rightLeg.rotation.x = -swing;
            parts.leftArm.rotation.x = -swing * 0.8;
            parts.rightArm.rotation.x = swing * 0.8;
          });
          roofToggles.forEach(toggle => {
            toggle.amount += ((toggle.open ? 1 : 0) - toggle.amount) * 0.12;
            if (toggle.walls) toggle.walls.scale.y = 1 - 0.7 * toggle.amount;
            if (toggle.apply) toggle.apply(toggle.amount);
            if (toggle.roof) toggle.roof.visible = !toggle.open;
          });

          updateWorld(time);
          updateNetwork(time);
          failureCtl.late(time);
          updateDusk();
          applyDuskLamps();

          // Usina: ventoinhas girando e fumaça nas chaminés
          plantFans.forEach(fan => {
            fan.rotation.y += 0.25;
          });
          plantSteam.forEach(p => {
            p.position.y += p.userData.speed;
            p.position.x += Math.sin(time * 2 + p.position.y) * 0.005;
            p.scale.addScalar(p.userData.scaleSpeed);
            p.material.opacity -= 0.004;

            if (p.material.opacity <= 0 || p.position.y > p.userData.baseY + 3.0) {
              p.position.y = p.userData.baseY;
              p.position.x = p.userData.emitterX + (Math.random() - 0.5) * 0.2;
              p.position.z = p.userData.emitterZ + (Math.random() - 0.5) * 0.2;
              p.scale.set(1, 1, 1);
              p.material.opacity = 0.45;
            }
          });

          // Cidade: pulsos, cabos e janelas seguem o estado do disjuntor
          const breakerOn = breakerClosedRef.current;
          cityPulses.forEach(p => {
            const lit = breakerOn && failureSim.lit(p.position.x + cityWorld.position.x, p.position.z + cityWorld.position.z);
            p.visible = lit;
            if (lit) {
              p.userData.progress = (p.userData.progress + p.userData.speed) % 1;
              p.position.copy(p.userData.curve.getPoint(p.userData.progress));
            }
          });
          cityWires.forEach(w => {
            if (!w.center) {
              w.mesh.geometry.computeBoundingBox();
              w.center = w.mesh.geometry.boundingBox.getCenter(new THREE.Vector3());
            }
            const lit = breakerOn && failureSim.lit(w.center.x + cityWorld.position.x, w.center.z + cityWorld.position.z);
            w.mesh.material.color.setHex(lit ? w.baseColor : 0x64748b);
            w.mesh.material.emissive.setHex(lit ? w.baseColor : 0x000000);
          });
          cityWindows.forEach(win => {
            if (!win.userData.wp) win.userData.wp = win.getWorldPosition(new THREE.Vector3());
            const lit = breakerOn && failureSim.lit(win.userData.wp.x, win.userData.wp.z);
            win.material.color.setHex(lit ? 0xf3e6a8 : (win.userData.dayColor || 0x334155));
          });

          // Pessoas caminhando: posição pela distância percorrida, passos sincronizados com ela
          walkers.forEach(w => {
            if (w.knocked) return;
            const travelled = time * w.speed + w.offset;
            const s = samplePath(w.path, travelled);
            w.group.position.set(s.x, 0.35, s.z);
            w.group.rotation.y = s.heading;

            const swing = Math.sin(travelled * 4.5) * 0.7;
            const { leftLeg, rightLeg, leftArm, rightArm } = w.group.userData;
            leftLeg.rotation.x = swing;
            rightLeg.rotation.x = -swing;
            leftArm.rotation.x = -swing * 0.8;
            rightArm.rotation.x = swing * 0.8;
          });

          // Animação suave de pulso do transformador quando energizado
          if (breakerClosed && componentMeshesRef.current['transformer']) {
            const trafo = componentMeshesRef.current['transformer'];
            const vibe = Math.sin(time * 30) * 0.002 * (loadLevel / 100);
            trafo.position.y = vibe;
          }

          camera.position.add(failureCtl.shake);
          renderer.render(scene, camera);
          camera.position.sub(failureCtl.shake);
        };

        animate();
