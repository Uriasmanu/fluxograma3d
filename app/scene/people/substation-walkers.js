        // 9. PESSOAS ANDANDO PELOS CORREDORES DA SUBESTAÇÃO
        const createWorker = (vestColor) => {
          const worker = new THREE.Group();
          const matVest = new THREE.MeshStandardMaterial({ color: vestColor, roughness: 0.6 });
          const matSkin = new THREE.MeshStandardMaterial({ color: '#f1c7a1', roughness: 0.8 });
          const matPants = new THREE.MeshStandardMaterial({ color: '#2f3b52', roughness: 0.8 });
          const matHelmet = new THREE.MeshStandardMaterial({ color: '#ffd23f', roughness: 0.4 });

          // Cada membro gira em torno de um pivô (quadril ou ombro)
          const makeLimb = (geo, mat, x, y, drop) => {
            const pivot = new THREE.Group();
            pivot.position.set(x, y, 0);
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.y = drop;
            mesh.castShadow = true;
            pivot.add(mesh);
            return pivot;
          };

          const legGeo = new THREE.BoxGeometry(0.16, 0.8, 0.16);
          const armGeo = new THREE.BoxGeometry(0.12, 0.6, 0.12);
          const leftLeg = makeLimb(legGeo, matPants, -0.11, 0.85, -0.4);
          const rightLeg = makeLimb(legGeo, matPants, 0.11, 0.85, -0.4);
          const leftArm = makeLimb(armGeo, matVest, -0.28, 1.4, -0.28);
          const rightArm = makeLimb(armGeo, matVest, 0.28, 1.4, -0.28);
          worker.add(leftLeg, rightLeg, leftArm, rightArm);

          const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.6, 0.26), matVest);
          torso.position.y = 1.15;
          torso.castShadow = true;
          worker.add(torso);

          const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), matSkin);
          head.position.y = 1.62;
          head.castShadow = true;
          worker.add(head);

          const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), matHelmet);
          helmet.position.y = 1.66;
          helmet.castShadow = true;
          worker.add(helmet);

          worker.userData = { leftLeg, rightLeg, leftArm, rightArm, head, helmet };
          return worker;
        };

        // Trajetos em [x, z]: 'loop' fecha o circuito, 'pingpong' vai e volta
        const makePath = (points, mode) => {
          const pts = mode === 'loop' ? [...points, points[0]] : points;
          const segs = [];
          let total = 0;
          for (let i = 0; i < pts.length - 1; i++) {
            const a = pts[i];
            const b = pts[i + 1];
            const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
            segs.push({ a, b, len, start: total });
            total += len;
          }
          return { segs, total, mode };
        };

        const samplePath = (path, distance) => {
          const span = path.mode === 'loop' ? path.total : path.total * 2;
          let d = ((distance % span) + span) % span;
          let dir = 1;
          if (path.mode === 'pingpong' && d > path.total) {
            d = span - d;
            dir = -1;
          }
          const seg = path.segs.find(s => d <= s.start + s.len) || path.segs[path.segs.length - 1];
          const t = seg.len === 0 ? 0 : (d - seg.start) / seg.len;
          const dx = seg.b[0] - seg.a[0];
          const dz = seg.b[1] - seg.a[1];
          return { x: seg.a[0] + dx * t, z: seg.a[1] + dz * t, heading: Math.atan2(dx * dir, dz * dir) };
        };

        const walkerDefs = [
          {
            color: '#ff7a1a', mode: 'loop', speed: 1.3, offset: 0,
            points: [
              [-6.3, 6.3], [6.3, 6.3], [6.3, 0.35],
              [14.2, 0.35], [14.2, -6.5], [23.2, -6.5], [23.2, 6.8], [11, 6.8], [11, 0.35],
              [6.3, 0.35], [6.3, -6.3], [-6.3, -6.3]
            ]
          },
          {
            color: '#ffd23f', mode: 'loop', speed: 1.1, offset: 45,
            points: [
              [-6.3, -6.3], [6.3, -6.3], [6.3, 0.35],
              [11, 0.35], [11, 6.8], [23.2, 6.8], [23.2, -6.5], [14.2, -6.5], [14.2, 0.35],
              [6.3, 0.35], [6.3, 6.3], [-6.3, 6.3]
            ]
          }
        ];

        const walkers = walkerDefs.map(def => {
          const group = createWorker(def.color);
          substationGroup.add(group);
          return { group, path: makePath(def.points, def.mode), speed: def.speed, offset: def.offset };
        });
