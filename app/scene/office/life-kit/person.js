          // ---------- Pessoa detalhada (esqueleto articulado com IK) ----------
          const THIGH = 0.43;
          const SHIN = 0.41;
          const UARM = 0.3;
          const FARM = 0.3;
          const ANKLE = 0.07;
          const createPerson = (o) => {
            const skinMat = stdMat(o.skin, 0.8);
            const shirtMat = stdMat(o.shirt, 0.7);
            const shadeMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(o.shirt).multiplyScalar(0.7), roughness: 0.7 });
            const pantsMat = stdMat(o.pants, 0.8);
            const hairMat = stdMat(o.hair, 0.8);
            const darkMat = stdMat('#1f2429', 0.5);
            const whiteMat = stdMat('#f4f7f5', 0.5);
            const greenMat = stdMat(GREEN, 0.5);
            const lensMat = new THREE.MeshStandardMaterial({ color: '#9fd0e8', roughness: 0.2, transparent: true, opacity: 0.35 });

            const root = new THREE.Group();
            const upper = new THREE.Group();
            root.add(upper);
            addMesh(upper, box(0.42, 0.2, 0.26), pantsMat, 0, -0.02, 0);
            addMesh(upper, box(0.46, 0.5, 0.27), shirtMat, 0, 0.3, 0);
            [-1, 1].forEach(s => addMesh(upper, new THREE.SphereGeometry(0.06, 8, 6), shirtMat, s * 0.27, 0.51, 0));
            addMesh(upper, new THREE.CylinderGeometry(0.05, 0.055, 0.08, 8), skinMat, 0, 0.6, 0);
            if (o.top === 'hoodie') {
              addMesh(upper, box(0.3, 0.1, 0.12), shadeMat, 0, 0.56, -0.1);
              addMesh(upper, box(0.3, 0.1, 0.02), shadeMat, 0, 0.1, 0.14);
              [-1, 1].forEach(s => addMesh(upper, box(0.012, 0.12, 0.012), whiteMat, s * 0.04, 0.5, 0.14));
            } else if (o.top === 'shirt') {
              addMesh(upper, box(0.2, 0.035, 0.03), shadeMat, 0, 0.56, 0.12);
              addMesh(upper, box(0.015, 0.46, 0.01), shadeMat, 0, 0.3, 0.137);
              [0.1, 0.22, 0.34, 0.46].forEach(y => addMesh(upper, box(0.02, 0.02, 0.012), whiteMat, 0, y, 0.14));
            } else {
              addMesh(upper, new THREE.TorusGeometry(0.055, 0.012, 6, 10), shadeMat, 0, 0.56, 0).rotation.x = Math.PI / 2;
            }
            if (o.logo) {
              const logoCanvas = canvasOf(128, 128);
              const lg = logoCanvas.getContext('2d');
              lg.fillStyle = '#2f9e5e';
              [[64, 8, 34, 52], [64, 40, 46, 56]].forEach(([cx, top, hw, h]) => {
                lg.beginPath();
                lg.moveTo(cx, top);
                lg.lineTo(cx - hw, top + h);
                lg.lineTo(cx + hw, top + h);
                lg.fill();
              });
              lg.fillRect(56, 92, 16, 28);
              const logo = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.09), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(logoCanvas), transparent: true, alphaTest: 0.2 }));
              logo.position.set(-0.11, 0.38, 0.1415);
              upper.add(logo);
              if (o.top === 'hoodie') [-1, 1].forEach(sd => addMesh(upper, box(0.014, 0.2, 0.012), whiteMat, sd * 0.045, 0.43, 0.142, false));
            } else {
              addMesh(upper, box(0.02, 0.36, 0.01), greenMat, 0, 0.38, 0.139);
              addMesh(upper, box(0.07, 0.1, 0.01), whiteMat, 0, 0.17, 0.143);
              addMesh(upper, box(0.07, 0.03, 0.012), greenMat, 0, 0.2, 0.144);
            }

            const head = new THREE.Group();
            head.position.set(0, 0.64, 0);
            upper.add(head);
            addMesh(head, new THREE.SphereGeometry(0.15, 14, 10), skinMat, 0, 0.14, 0);
            [-0.15, 0.15].forEach(ex => addMesh(head, new THREE.SphereGeometry(0.03, 6, 6), skinMat, ex, 0.14, 0));
            addMesh(head, new THREE.SphereGeometry(0.02, 6, 6), skinMat, 0, 0.12, 0.15);
            let eyes;
            if (o.bigEyes) {
              const irisMat = stdMat('#5a3a22', 0.4);
              const whiteEye = stdMat('#fbfbf8', 0.3);
              eyes = [-0.058, 0.058].map(ex => {
                const eye = new THREE.Group();
                eye.position.set(ex, 0.15, 0.128);
                head.add(eye);
                addMesh(eye, new THREE.SphereGeometry(0.036, 12, 10), whiteEye, 0, 0, 0, false);
                addMesh(eye, new THREE.SphereGeometry(0.026, 10, 8), irisMat, 0, 0, 0.016, false);
                addMesh(eye, new THREE.SphereGeometry(0.014, 8, 6), darkMat, 0, 0, 0.03, false);
                addMesh(eye, new THREE.SphereGeometry(0.005, 6, 5), whiteEye, 0.01, 0.01, 0.036, false);
                return eye;
              });
              [-0.058, 0.058].forEach((ex, i) => {
                const brow = addMesh(head, box(0.075, 0.02, 0.012), hairMat, ex, 0.205, 0.14, false);
                brow.rotation.z = (i === 0 ? -1 : 1) * 0.08;
              });
            } else {
              eyes = [-0.055, 0.055].map(ex => addMesh(head, new THREE.SphereGeometry(0.018, 8, 6), darkMat, ex, 0.15, 0.138));
              [-0.055, 0.055].forEach(ex => addMesh(head, box(0.05, 0.01, 0.01), hairMat, ex, 0.2, 0.14));
            }
            const mouth = addMesh(head, box(0.05, 0.01, 0.01), stdMat('#a8525a'), 0, 0.07, 0.143);

            const hairCap = (r, tilt) => {
              const cap = addMesh(head, new THREE.SphereGeometry(r, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), hairMat, 0, 0.15, 0);
              cap.rotation.x = tilt;
              return cap;
            };
            if (o.hairStyle === 'short') hairCap(0.162, -0.35);
            else if (o.hairStyle === 'long') {
              hairCap(0.165, -0.35);
              addMesh(head, new THREE.SphereGeometry(0.12, 8, 8), hairMat, 0, 0.02, -0.1).scale.set(1.25, 1.9, 0.9);
            } else if (o.hairStyle === 'bun') {
              hairCap(0.162, -0.35);
              addMesh(head, new THREE.SphereGeometry(0.06, 8, 8), hairMat, 0, 0.3, -0.11);
            } else if (o.hairStyle === 'curly') {
              for (let i = 0; i < 9; i++) {
                const a = (i / 9) * Math.PI * 2;
                addMesh(head, new THREE.SphereGeometry(0.07, 8, 6), hairMat, Math.cos(a) * 0.1, 0.25 + (i % 2) * 0.02, Math.sin(a) * 0.1 - 0.03);
              }
              addMesh(head, new THREE.SphereGeometry(0.09, 8, 6), hairMat, 0, 0.31, -0.02);
            } else if (o.hairStyle === 'fade') {
              const top = hairCap(0.168, -0.28);
              top.scale.set(1, 1.22, 1.04);
              const fadeMat = new THREE.MeshStandardMaterial({ color: o.hair, roughness: 0.9, transparent: true, opacity: 0.55 });
              addMesh(head, new THREE.SphereGeometry(0.156, 14, 6, 0, Math.PI * 2, Math.PI * 0.34, Math.PI * 0.22), fadeMat, 0, 0.14, 0, false);
            } else if (o.hairStyle === 'cap') {
              const cap = hairCap(0.165, -0.25);
              cap.material = greenMat;
              addMesh(head, box(0.2, 0.012, 0.12), greenMat, 0, 0.2, 0.18).rotation.x = 0.1;
            }
            if (o.glasses === 'round') {
              const wireMat = stdMat('#b9b2a0', 0.25);
              [-0.058, 0.058].forEach(ex => {
                addMesh(head, new THREE.TorusGeometry(0.052, 0.0042, 6, 20), wireMat, ex, 0.15, 0.158, false);
                const lens = new THREE.Mesh(new THREE.CircleGeometry(0.05, 18), lensMat);
                lens.position.set(ex, 0.15, 0.158);
                head.add(lens);
                addMesh(head, box(0.006, 0.006, 0.15), wireMat, ex * 2.45, 0.15, 0.08, false);
              });
              addMesh(head, box(0.02, 0.006, 0.006), wireMat, 0, 0.16, 0.158, false);
            } else if (o.glasses) {
              [-0.055, 0.055].forEach(ex => {
                addMesh(head, box(0.08, 0.06, 0.008), darkMat, ex, 0.15, 0.146);
                addMesh(head, box(0.064, 0.044, 0.01), lensMat, ex, 0.15, 0.151);
                addMesh(head, box(0.01, 0.01, 0.14), darkMat, ex * 2.5, 0.15, 0.07);
              });
            }
            if (o.headphones) {
              const band = addMesh(head, new THREE.TorusGeometry(0.17, 0.012, 6, 16, Math.PI), darkMat, 0, 0.14, 0);
              band.scale.z = 1;
              [-1, 1].forEach(s => addMesh(head, new THREE.CylinderGeometry(0.05, 0.05, 0.04, 10), darkMat, s * 0.165, 0.14, 0).rotation.z = Math.PI / 2);
            }
            if (o.beard) addMesh(head, new THREE.SphereGeometry(0.09, 8, 6), hairMat, 0, 0.05, 0.06).scale.set(1, 0.75, 0.9);
            if (o.stubble) {
              const stubbleMat = new THREE.MeshStandardMaterial({ color: '#3a2a20', roughness: 1, transparent: true, opacity: 0.62 });
              addMesh(head, new THREE.SphereGeometry(0.153, 16, 8, 0, Math.PI * 2, Math.PI * 0.6, Math.PI * 0.4), stubbleMat, 0, 0.14, 0, false);
              addMesh(head, box(0.075, 0.016, 0.01), stubbleMat, 0, 0.088, 0.138, false);
              addMesh(head, box(0.05, 0.03, 0.01), stubbleMat, 0, 0.04, 0.14, false);
            }

            const makeSeg = (len, r, material) => {
              const group = new THREE.Group();
              addMesh(group, new THREE.CylinderGeometry(r, r * 0.9, len, 8), material, 0, -len / 2, 0);
              root.add(group);
              return group;
            };
            const makeBall = (r, material) => addMesh(root, new THREE.SphereGeometry(r, 8, 6), material, 0, 0, 0);
            const shoeMat = stdMat(o.shoe || '#e8ecef', 0.6);
            const legs = [-1, 1].map(s => {
              const boot = new THREE.Group();
              addMesh(boot, box(0.115, 0.07, 0.27), shoeMat, 0, 0.035 + 0.01, 0.07);
              addMesh(boot, box(0.12, 0.02, 0.28), whiteMat, 0, 0.01, 0.07);
              root.add(boot);
              return { s, thigh: makeSeg(THIGH, 0.075, pantsMat), shin: makeSeg(SHIN, 0.06, pantsMat), knee: makeBall(0.066, pantsMat), boot };
            });
            const longSleeves = o.sleeves === 'long';
            const rolled = o.sleeves === 'rolled';
            const tee = o.sleeves === 'tee';
            let tattooMat = null;
            if (o.tattoo !== undefined) {
              const tc = canvasOf(256, 128);
              const tg = tc.getContext('2d');
              tg.fillStyle = o.skin;
              tg.fillRect(0, 0, 256, 128);
              tg.strokeStyle = '#23262c';
              tg.fillStyle = '#23262c';
              tg.lineWidth = 3;
              [0, 128].forEach(ox => {
                tg.beginPath();
                tg.moveTo(ox + 10, 16);
                tg.lineTo(ox + 118, 16);
                tg.moveTo(ox + 10, 112);
                tg.lineTo(ox + 118, 112);
                tg.stroke();
                for (let i = 0; i < 5; i++) {
                  tg.beginPath();
                  tg.moveTo(ox + 14 + i * 22, 24);
                  tg.bezierCurveTo(ox + 40 + i * 22, 40, ox + 4 + i * 22, 70, ox + 30 + i * 22, 100);
                  tg.stroke();
                }
                tg.beginPath();
                tg.arc(ox + 64, 64, 22, 0, Math.PI * 2);
                tg.stroke();
                tg.beginPath();
                tg.moveTo(ox + 64, 44);
                tg.lineTo(ox + 76, 74);
                tg.lineTo(ox + 52, 74);
                tg.closePath();
                tg.fill();
                [[30, 56], [98, 70], [40, 90], [90, 40]].forEach(([dx, dy]) => {
                  tg.beginPath();
                  tg.arc(ox + dx, dy, 3.2, 0, Math.PI * 2);
                  tg.fill();
                });
              });
              tattooMat = new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(tc), roughness: 0.8 });
            }
            const arms = [-1, 1].map((s, ai) => {
              const foreMat = tattooMat && o.tattoo === ai ? tattooMat : (longSleeves ? shirtMat : skinMat);
              const fore = makeSeg(FARM, 0.048, foreMat);
              if (s === 1) addMesh(fore, new THREE.CylinderGeometry(0.052, 0.052, 0.03, 8), darkMat, 0, -0.24, 0);
              if (rolled) addMesh(fore, new THREE.CylinderGeometry(0.064, 0.064, 0.06, 10), shirtMat, 0, -0.02, 0);
              const upperMat = tee ? (tattooMat && o.tattoo === ai ? tattooMat : skinMat) : shirtMat;
              const upperSeg = makeSeg(UARM, 0.055, upperMat);
              if (tee) addMesh(upperSeg, new THREE.CylinderGeometry(0.066, 0.062, 0.13, 10), shirtMat, 0, -0.045, 0);
              return { s, upper: upperSeg, fore, elbow: makeBall(0.054, longSleeves || rolled ? shirtMat : skinMat), hand: makeBall(0.06, skinMat) };
            });

            const mug = new THREE.Group();
            const mugMat = stdMat(o.mugColor || '#e8ecef', 0.5);
            addMesh(mug, new THREE.CylinderGeometry(0.04, 0.036, 0.09, 12), mugMat, 0, 0, 0);
            addMesh(mug, new THREE.TorusGeometry(0.03, 0.007, 6, 10, Math.PI), mugMat, 0.04, 0, 0).rotation.z = -Math.PI / 2;
            const coffee = addMesh(mug, new THREE.CylinderGeometry(0.034, 0.034, 0.004, 12), stdMat('#3b2416', 0.3), 0, 0.04, 0, false);
            const steamMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, depthWrite: false });
            const steam = [0, 1, 2].map(() => {
              const puff = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 5), steamMat.clone());
              mug.add(puff);
              return puff;
            });
            root.add(mug);

            const hip = V(0, 0.88, 0);
            const sh = V(0, 0, 0);
            const t1 = V(0, 0, 0);
            const t2 = V(0, 0, 0);
            const ankle = V(0, 0, 0);
            const rootHip = V(0, 0, 0);
            const mouthP = V(0, 0, 0);
            const handEnd = [V(0, 0, 0), V(0, 0, 0)];
            const poleLeg = V(0, 0.1, 1);
            const poleArm = V(0, -0.8, -0.2);
            const sipOffset = V(0, -0.045, -0.01);
            const chinOffset = V(0, -0.075, 0.03);
            const mugOffset = V(0, 0, 0.06);
            let ikErr = 0;
            const seed = o.blinkSeed || 0;

            const apply = (s) => {
              ikErr = 0;
              hip.copy(s.hip);
              upper.position.copy(hip);
              upper.rotation.x = s.lean;
              head.rotation.set(s.headX, s.headY, s.headZ || 0);
              const blink = (s.time + seed) % 4.3 < 0.12 ? 0.1 : 1;
              eyes.forEach(eye => eye.scale.y = blink);
              mouth.scale.set(1 + 0.5 * (s.smile || 0), 0.6 + (s.talk || 0) * 2.2 + (s.smile || 0) * 0.5, 1);

              legs.forEach((leg, i) => {
                rootHip.set(leg.s * 0.1, hip.y - 0.02, hip.z);
                ankle.copy(s.feet[i]);
                ankle.y += ANKLE;
                poleLeg.x = leg.s * 0.08;
                solve(rootHip, ankle, THIGH, SHIN, poleLeg);
                ikErr = Math.max(ikErr, ik.err);
                aim(leg.thigh, rootHip, ik.mid);
                aim(leg.shin, ik.mid, ik.end);
                leg.knee.position.copy(ik.mid);
                leg.boot.position.copy(s.feet[i]);
              });

              root.updateMatrixWorld(true);
              mouthP.set(0, 0.07, 0.15);
              head.localToWorld(mouthP);
              root.worldToLocal(mouthP);
              const mugHand = s.mugHand || 0;

              arms.forEach((arm, i) => {
                t1.copy(s.hands[i]);
                if (i === mugHand && s.sip) {
                  t2.copy(mouthP).add(sipOffset);
                  t1.lerp(t2, s.sip);
                }
                if (i === 0 && s.chin) {
                  t2.copy(mouthP).add(chinOffset);
                  t1.lerp(t2, s.chin);
                }
                leanPoint(sh, arm.s * 0.27, 0.53, 0, s.lean).add(hip);
                poleArm.x = arm.s * 1.0;
                solve(sh, t1, UARM, FARM, poleArm);
                ikErr = Math.max(ikErr, ik.err);
                root.userData.err = ikErr;
                officeLife.debug.err = Math.max(officeLife.debug.err || 0, ik.err);
                aim(arm.upper, sh, ik.mid);
                aim(arm.fore, ik.mid, ik.end);
                arm.elbow.position.copy(ik.mid);
                arm.hand.position.copy(ik.end);
                handEnd[i].copy(ik.end);
              });

              mug.visible = s.mugVisible !== false;
              if (s.mugPos) {
                mug.position.copy(s.mugPos);
                mug.rotation.x = 0;
              } else {
                mug.position.copy(handEnd[mugHand]).add(mugOffset);
                mug.rotation.x = -0.6 * (s.sip || 0);
              }
              const level = s.level === undefined ? 0.7 : s.level;
              coffee.visible = level > 0.03;
              coffee.position.y = -0.04 + level * 0.08;
              steam.forEach((puff, i) => {
                const q = (s.time * 0.5 + i / 3) % 1;
                puff.visible = level > 0.3;
                puff.position.set(Math.sin(s.time * 2 + i * 2) * 0.012, 0.055 + q * 0.07, 0);
                puff.scale.setScalar(0.012 + q * 0.02);
                puff.material.opacity = (1 - q) * 0.3;
              });
            };
            return { root, apply, mug, hands: handEnd };
          };

          const makeState = () => ({
            hip: V(0, 0.88, 0), lean: 0.03, headX: 0, headY: 0, headZ: 0,
            feet: [V(-0.11, 0, 0), V(0.11, 0, 0)], hands: [V(0, 0, 0), V(0, 0, 0)],
            sip: 0, chin: 0, mugHand: 0, mugPos: null, mugVisible: true, level: 0.7, talk: 0, smile: 0, time: 0
          });
