        // 14. COMUNICAÇÃO SIMULADA: E3 (CONSULTA), SYNC (RABBITMQ), BANCO DE DADOS E SIGMA ECM
        const plantToWorld = (x, y, z) => new THREE.Vector3(16.4 - x, 0.3 + y, -z);

        const netCableMat = new THREE.MeshStandardMaterial({ color: '#5b6772', roughness: 0.5 });
        const addPolyline = (points, radius) => {
          const up = new THREE.Vector3(0, 1, 0);
          for (let i = 0; i < points.length - 1; i++) {
            const a = points[i];
            const b = points[i + 1];
            const dir = new THREE.Vector3().subVectors(b, a);
            const length = dir.length();
            if (length === 0) continue;

            const seg = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 6), netCableMat);
            seg.position.copy(a).add(b).multiplyScalar(0.5);
            seg.quaternion.setFromUnitVectors(up, dir.normalize());
            seg.castShadow = true;
            scene.add(seg);

            if (i > 0) {
              const joint = new THREE.Mesh(new THREE.SphereGeometry(radius, 8, 6), netCableMat);
              joint.position.copy(a);
              scene.add(joint);
            }
          }
        };

        // PCs do escritório da usina: usuários do Sigma ECM, ligados ao servidor da Treetech por cabo
        const serverX = TREETECH_POS.x + 1.7;
        const serverTop = new THREE.Vector3(serverX, 1.5, TREETECH_POS.z - 3.7);
        const netCables = [
          { label: 'PC 1', towerX: -3.9, laneZ: 0.25, finalX: serverX + 0.2 },
          { label: 'PC 2', towerX: -2.1, laneZ: 0.15, finalX: serverX },
          { label: 'PC 3', towerX: -0.3, laneZ: 0.05, finalX: serverX - 0.2 }
        ].map(def => {
          const points = [
            plantToWorld(def.towerX, 0.35, 0.45),
            plantToWorld(def.towerX, 0.17, def.laneZ),
            plantToWorld(-5.75, 0.17, def.laneZ),
            new THREE.Vector3(def.finalX, 0.4, -def.laneZ),
            new THREE.Vector3(def.finalX, 0.4, TREETECH_POS.z - 4.5),
            new THREE.Vector3(def.finalX, 0.8, TREETECH_POS.z - 4.05)
          ];
          addPolyline(points, 0.045);

          const lengths = [];
          let length = 0;
          for (let i = 0; i < points.length - 1; i++) {
            length += points[i].distanceTo(points[i + 1]);
            lengths.push(length);
          }
          return { label: def.label, points, lengths, length };
        });

        // Fila do RabbitMQ: tubo de vidro ao lado da Treetech; a altura da pilha é a profundidade
        const MAX_QUEUE_BOXES = 7;
        const queueGroup = new THREE.Group();
        queueGroup.position.set(TREETECH_POS.x + 4, 0.3, TREETECH_POS.z - 6.1);
        scene.add(queueGroup);

        const queueGlassMat = new THREE.MeshStandardMaterial({ color: '#cfe3ea', transparent: true, opacity: 0.28, roughness: 0.1 });
        queueGlassMat.userData.preserve = true;
        const queueMetalMat = new THREE.MeshStandardMaterial({ color: '#7a8088', roughness: 0.5 });
        const queueTube = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 2.0, 16), queueGlassMat);
        queueTube.position.y = 1.0;
        queueGroup.add(queueTube);
        const queueBase = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 16), queueMetalMat);
        queueBase.position.y = 0.06;
        queueBase.castShadow = true;
        queueGroup.add(queueBase);
        const queueCap = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16), queueMetalMat);
        queueCap.position.y = 2.05;
        queueGroup.add(queueCap);

        const packetGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const packetMats = {
          msg: new THREE.MeshBasicMaterial({ color: '#d9783a' }),
          query: new THREE.MeshBasicMaterial({ color: '#6ea8c0' }),
          answer: new THREE.MeshBasicMaterial({ color: '#6fbf8a' })
        };

        const queueBoxes = [];
        for (let i = 0; i < MAX_QUEUE_BOXES; i++) {
          const queued = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.22, 0.4), packetMats.msg);
          queued.position.y = 0.25 + i * 0.26;
          queued.visible = false;
          queueGroup.add(queued);
          queueBoxes.push(queued);
        }

        // Arcos de comunicação: módulo -> antena da subestação -> antena da Treetech -> servidor, fila, banco e painel
        const arcLineMat = new THREE.LineBasicMaterial({ color: '#9aa7b2', transparent: true, opacity: 0.6 });
        const makeArc = (a, b, lift) => {
          const line = new THREE.Line(new THREE.BufferGeometry(), arcLineMat.clone());
          scene.add(line);
          const arc = { points: [], lengths: [], length: 0, line };
          // Recalcula a curva a partir dos extremos atuais (o painel sobe quando os andares se afastam)
          arc.rebuild = () => {
            const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
            mid.y += lift;
            arc.points = new THREE.QuadraticBezierCurve3(a.clone(), mid, b.clone()).getPoints(32);
            arc.lengths = [];
            arc.length = 0;
            for (let i = 0; i < arc.points.length - 1; i++) {
              arc.length += arc.points[i].distanceTo(arc.points[i + 1]);
              arc.lengths.push(arc.length);
            }
            line.geometry.setFromPoints(arc.points);
          };
          arc.rebuild();
          return arc;
        };

        const moduleKeys = ['tm', 'bm', 'gmp', 'dm1', 'dm2'];
        const moduleLabels = { tm: 'TM', bm: 'BM', gmp: 'GMP', dm1: 'DM 1', dm2: 'DM 2' };
        const arcModule = {};
        moduleKeys.forEach(key => {
          arcModule[key] = makeArc(moduleNodes[key].top, mastSub.top, 2.2);
        });
        const queueTop = new THREE.Vector3(queueGroup.position.x, 2.4, queueGroup.position.z);
        const dashboardPoint = new THREE.Vector3(52, treetechRoof.panelY(), 5.8);
        const arcLink = makeArc(mastSub.top, mastTt.top, 16);
        const arcServer = makeArc(mastTt.top, serverTop, 3);
        const arcQueueIn = makeArc(mastTt.top, queueTop, 2);
        const arcQueueOut = makeArc(queueTop, serverTop, 2.5);
        const arcDb = dbNodes.map(db => makeArc(serverTop, db.top, 2.5));
        const arcSigma = dbNodes.map(db => makeArc(db.top, dashboardPoint, 5));

        const net = {
          last: 0, mode: 'sync', depth: 0, flash: 0, activeDb: 0,
          received: 0, saved: 0, shown: 0, recvBucket: 0, savedBucket: 0,
          nextTick: 1, nextDraw: 0, nextConsume: 6, nextPoll: 1, pollIndex: 0, nextDbSwitch: 14,
          nextSend: [1, 2, 3, 4, 5], nextUser: [2, 5, 8],
          history: { recv: [], saved: [] }, events: []
        };
