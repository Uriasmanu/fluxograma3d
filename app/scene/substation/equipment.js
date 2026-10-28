        // 3. TRANSFORMADOR PRINCIPAL (CENTRAL)
        const createMainTransformer = () => {
          const trafoGroup = new THREE.Group();
          trafoGroup.name = "transformer";

          // Corpo Principal Tanque do Trafo
          const bodyGeo = new THREE.BoxGeometry(3.2, 2.2, 2.4);
          const body = new THREE.Mesh(bodyGeo, matTrafo);
          body.position.set(0, 1.4, 0);
          body.castShadow = true;
          body.receiveShadow = true;
          trafoGroup.add(body);

          // Tanque Conservador Superior (Cilindro)
          const consGeo = new THREE.CylinderGeometry(0.5, 0.5, 2.8, 16);
          consGeo.rotateZ(Math.PI / 2);
          const conservator = new THREE.Mesh(consGeo, matTrafo);
          conservator.position.set(-0.2, 3.2, -0.6);
          conservator.castShadow = true;
          trafoGroup.add(conservator);

          // Suportes do Conservador
          const suppGeo = new THREE.BoxGeometry(0.1, 0.8, 0.1);
          const s1 = new THREE.Mesh(suppGeo, matSteel);
          s1.position.set(-1.0, 2.7, -0.6);
          const s2 = new THREE.Mesh(suppGeo, matSteel);
          s2.position.set(0.6, 2.7, -0.6);
          trafoGroup.add(s1);
          trafoGroup.add(s2);

          // Buchas de Alta Tensão (AT) - 3 Fases
          const bushingsAT = [];
          for (let i = -1; i <= 1; i++) {
            const b = createBushing(1.4, 0.22);
            b.position.set(i * 0.8, 2.5 + 0.7, 0.4);
            trafoGroup.add(b);
            bushingsAT.push(b);
          }

          // Buchas de Média Tensão (MT) - 4 Fases (com neutro)
          for (let i = -1.2; i <= 1.2; i += 0.8) {
            const b = createBushing(0.9, 0.15);
            b.position.set(i, 2.5 + 0.45, -0.6);
            trafoGroup.add(b);
          }

          // Bateria de Radiadores de Refrigeração na Lateral Posterior
          const radGroup = new THREE.Group();
          radGroup.name = "radiators";
          for (let r = -1.2; r <= 1.2; r += 0.4) {
            const radFin = new THREE.BoxGeometry(0.12, 1.8, 1.6);
            const fin = new THREE.Mesh(radFin, matRadiator);
            fin.position.set(r, 1.4, -2.0);
            fin.castShadow = true;
            radGroup.add(fin);
          }
          // Tubos de conexão do radiador ao tanque
          const pipeGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.6);
          pipeGeo.rotateZ(Math.PI / 2);
          const pipeTop = new THREE.Mesh(pipeGeo, matSteel);
          pipeTop.position.set(0, 2.1, -2.0);
          const pipeBot = new THREE.Mesh(pipeGeo, matSteel);
          pipeBot.position.set(0, 0.7, -2.0);
          radGroup.add(pipeTop);
          radGroup.add(pipeBot);

          trafoGroup.add(radGroup);
          componentMeshesRef.current['radiators'] = radGroup;

          // Caixa do Painel do Trafo
          const ctrlBoxGeo = new THREE.BoxGeometry(0.8, 1.0, 0.4);
          const ctrlBox = new THREE.Mesh(ctrlBoxGeo, matCabinet);
          ctrlBox.position.set(-1.61, 1.2, 0.5);
          ctrlBox.castShadow = true;
          trafoGroup.add(ctrlBox);

          return trafoGroup;
        };

        const trafoMesh = createMainTransformer();
        substationGroup.add(trafoMesh);
        componentMeshesRef.current['transformer'] = trafoMesh;

        // 4. PÓRTICO METÁLICO DE ENTRADA (GANTRY FRAME)
        const createGantry = () => {
          const gantryGroup = new THREE.Group();
          gantryGroup.name = "gantry";

          const towerHeight = 7.5;
          const towerSpacing = 6.0;

          // Colunas Treliçadas Metálicas
          const createTrussColumn = (x, z) => {
            const col = new THREE.Group();
            const mainLegGeo = new THREE.CylinderGeometry(0.06, 0.08, towerHeight);

            // 4 pernas de cada torre treliçada
            const offset = 0.25;
            [[-offset, -offset], [offset, -offset], [-offset, offset], [offset, offset]].forEach(([ox, oz]) => {
              const leg = new THREE.Mesh(mainLegGeo, matSteel);
              leg.position.set(x + ox, towerHeight / 2 + 0.3, z + oz);
              leg.castShadow = true;
              col.add(leg);
            });

            // Travessas em Z
            for (let h = 1.0; h < towerHeight; h += 0.8) {
              const barGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.7);
              const bar = new THREE.Mesh(barGeo, matSteel);
              bar.position.set(x, h, z);
              bar.rotation.z = Math.PI / 4;
              col.add(bar);
            }
            return col;
          };

          gantryGroup.add(createTrussColumn(-towerSpacing / 2, -4.5));
          gantryGroup.add(createTrussColumn(towerSpacing / 2, -4.5));

          // Viga Transversal do Pórtico
          const beamLength = towerSpacing + 1.2;
          const beamGeo = new THREE.BoxGeometry(beamLength, 0.4, 0.4);
          const beam = new THREE.Mesh(beamGeo, matSteel);
          beam.position.set(0, towerHeight, -4.5);
          beam.castShadow = true;
          gantryGroup.add(beam);

          // Isoladores do Barramento de Alta Tensão Suspensos
          for (let i = -2; i <= 2; i += 2) {
            const stringBushing = createBushing(1.1, 0.14);
            stringBushing.position.set(i, towerHeight - 0.7, -4.5);
            gantryGroup.add(stringBushing);
          }

          return gantryGroup;
        };

        const gantryMesh = createGantry();
        substationGroup.add(gantryMesh);
        componentMeshesRef.current['gantry'] = gantryMesh;

        // 5. DISJUNTORES A GÁS SF6 E SECCIONADORAS (BAÍAS LATERAIS)
        const createCircuitBreakerUnit = (x, z, nameKey) => {
          const breakerGroup = new THREE.Group();
          breakerGroup.name = nameKey;

          // Pedestais metálicos de suporte
          const baseGeo = new THREE.BoxGeometry(1.4, 1.0, 1.0);
          const base = new THREE.Mesh(baseGeo, matSteel);
          base.position.set(x, 0.8, z);
          base.castShadow = true;
          breakerGroup.add(base);

          // 3 Polos com Buchas de Interrupção
          for (let p = -0.5; p <= 0.5; p += 0.5) {
            const pole = createBushing(1.1, 0.16);
            pole.position.set(x + p, 1.3 + 0.55, z);
            breakerGroup.add(pole);
          }

          // Gabinete mecânico do disjuntor
          const cabGeo = new THREE.BoxGeometry(0.5, 0.6, 0.3);
          const cab = new THREE.Mesh(cabGeo, matCabinet);
          cab.position.set(x, 0.8, z + 0.55);
          breakerGroup.add(cab);

          // LED Indicador de Estado (Verde = Aberto, Vermelho = Fechado)
          const ledGeo = new THREE.SphereGeometry(0.05, 8, 8);
          const matLed = new THREE.MeshBasicMaterial({ color: breakerClosed ? '#ef4444' : '#22c55e' });
          const led = new THREE.Mesh(ledGeo, matLed);
          led.position.set(x, 0.95, z + 0.71);
          breakerGroup.add(led);

          return breakerGroup;
        };

        const breaker1 = createCircuitBreakerUnit(-4.2, -1.0, 'breaker_1');
        const breaker2 = createCircuitBreakerUnit(4.2, 1.5, 'breaker_2');
        substationGroup.add(breaker1);
        substationGroup.add(breaker2);
        componentMeshesRef.current['breaker_1'] = breaker1;
        componentMeshesRef.current['breaker_2'] = breaker2;

        // 6. ARMÁRIOS DE COMANDO E CONTROLE SCADA
        const createControlCabinets = () => {
          const group = new THREE.Group();
          group.name = "cabinets";

          for (let c = 0; c < 2; c++) {
            const cabGeo = new THREE.BoxGeometry(1.0, 1.8, 0.8);
            const cab = new THREE.Mesh(cabGeo, matCabinet);
            cab.position.set(3.5 + c * 1.2, 1.2, -3.5);
            cab.castShadow = true;
            group.add(cab);

            // Maçanetas e fechaduras dos painéis
            const handleGeo = new THREE.BoxGeometry(0.04, 0.2, 0.05);
            const handle = new THREE.Mesh(handleGeo, matSteel);
            handle.position.set(3.8 + c * 1.2, 1.2, -3.08);
            group.add(handle);
          }

          return group;
        };

        const cabinetsMesh = createControlCabinets();
        substationGroup.add(cabinetsMesh);
        componentMeshesRef.current['cabinets'] = cabinetsMesh;

        // 7. ARRANJO DE PARA-RAIOS E MEDIÇÃO
        const createArresterRack = () => {
          const rackGroup = new THREE.Group();
          rackGroup.name = "arresters";

          const frameGeo = new THREE.BoxGeometry(2.2, 0.8, 0.4);
          const frame = new THREE.Mesh(frameGeo, matSteel);
          frame.position.set(4.5, 0.7, -0.5);
          rackGroup.add(frame);

          for (let a = -0.8; a <= 0.8; a += 0.8) {
            const arr = createBushing(1.0, 0.12);
            arr.position.set(4.5 + a, 1.1 + 0.5, -0.5);
            rackGroup.add(arr);
          }

          return rackGroup;
        };

        const arrestersMesh = createArresterRack();
        substationGroup.add(arrestersMesh);
        componentMeshesRef.current['arresters'] = arrestersMesh;

        // 8. CABOS DE CONEXÃO E CONDUTORES ELÉTRICOS (CATENÁRIAS)
        const createPowerCables = () => {
          const cablesGroup = new THREE.Group();
          const cableMat = new THREE.LineBasicMaterial({ color: 0x222222, linewidth: 2 });

          const drawCurve = (p1, p2, sag = 0.4) => {
            const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
            mid.y -= sag; // Curvatura natural do cabo por gravidade

            const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
            const points = curve.getPoints(20);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, cableMat);
            cablesGroup.add(line);

            // Criar partículas elétricas para animação de fluxo de energia
            if (breakerClosed) {
              const particleGeo = new THREE.BufferGeometry();
              const pCount = 5;
              const pPos = new Float32Array(pCount * 3);
              particleGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
              const pMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.15, transparent: true, opacity: 0.9 });
              const particles = new THREE.Points(particleGeo, pMat);
              particles.userData = { curve, speed: 0.008 + Math.random() * 0.004, progress: Math.random() };
              scene.add(particles);
              particleSystemsRef.current.push(particles);
            }
          };

          // Cabos do Pórtico para o Disjuntor 1
          drawCurve(new THREE.Vector3(-2, 6.8, -4.5), new THREE.Vector3(-4.2, 2.5, -1.0));
          drawCurve(new THREE.Vector3(0, 6.8, -4.5), new THREE.Vector3(-3.7, 2.5, -1.0));
          drawCurve(new THREE.Vector3(2, 6.8, -4.5), new THREE.Vector3(-4.7, 2.5, -1.0));

          // Cabos do Disjuntor 1 para as Buchas AT do Trafo
          drawCurve(new THREE.Vector3(-4.2, 2.5, -1.0), new THREE.Vector3(-0.8, 3.8, 0.4));
          drawCurve(new THREE.Vector3(-3.7, 2.5, -1.0), new THREE.Vector3(0, 3.8, 0.4));
          drawCurve(new THREE.Vector3(-4.7, 2.5, -1.0), new THREE.Vector3(0.8, 3.8, 0.4));

          // Cabos do Trafo para o Disjuntor 2
          drawCurve(new THREE.Vector3(0, 3.2, -0.6), new THREE.Vector3(4.2, 2.5, 1.5));

          return cablesGroup;
        };

        const cablesMesh = createPowerCables();
        substationGroup.add(cablesMesh);
