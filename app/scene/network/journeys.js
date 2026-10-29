        // Modo "acompanhar pacote" do tour: só o pacote herói trafega e a câmera o segue por trás
        const follow = {
          mode: null, hero: null, nextHero: 0, keyIndex: 0, stage: -1,
          anchor: new THREE.Vector3(), heading: new THREE.Vector3(1, 0, 0), prev: new THREE.Vector3()
        };

        const applyMode = () => {
          const sync = net.mode === 'sync';
          arcQueueIn.line.visible = sync;
          arcQueueOut.line.visible = sync;
          arcDb.forEach((arc, i) => { arc.line.material.opacity = i === net.activeDb ? 0.7 : 0.15; });
          arcSigma.forEach((arc, i) => { arc.line.material.opacity = i === net.activeDb ? 0.7 : 0.15; });
          dbNodes.forEach((db, i) => db.mat.color.set(i === net.activeDb ? '#9fc9ad' : '#cfd6dc'));
        };

        const cablePoint = (cable, dist) => {
          const d = Math.min(Math.max(dist, 0), cable.length);
          let i = cable.lengths.findIndex(l => d <= l);
          if (i < 0) i = cable.lengths.length - 1;
          const start = i === 0 ? 0 : cable.lengths[i - 1];
          const segLen = cable.lengths[i] - start;
          const t = segLen === 0 ? 0 : (d - start) / segLen;
          return new THREE.Vector3().lerpVectors(cable.points[i], cable.points[i + 1], t);
        };

        const formatClock = (time) =>
          `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(Math.floor(time % 60)).padStart(2, '0')}`;

        const logEvent = (time, text) => {
          net.events.unshift(`${formatClock(time)}  ${text}`);
          net.events.length = Math.min(net.events.length, 6);
        };

        // Um pacote percorre uma lista de trechos (dir = 1 segue o trecho; dir = -1 volta por ele)
        const journeys = [];
        const heroGlowColors = { msg: 0xffa860, query: 0x7fd0f0, answer: 0x8fe8a8 };
        const enterStep = (journey) => {
          const step = journey.steps[journey.index];
          journey.mesh.material = packetMats[step.kind] || packetMats.msg;
          journey.mesh.scale.setScalar(step.scale || 1.5);
          journey.dist = step.dir > 0 ? 0 : step.path.length;
          if (journey.glow) journey.glow.material.color.set(heroGlowColors[step.kind] || heroGlowColors.msg);
        };
        const startJourney = (steps, hero = false) => {
          const mesh = new THREE.Mesh(packetGeo, packetMats.msg);
          scene.add(mesh);
          const journey = { mesh, steps, index: 0, dist: 0, hero };
          if (hero) {
            journey.glow = new THREE.Sprite(new THREE.SpriteMaterial({
              map: glowTexture, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.9
            }));
            journey.glow.scale.set(0.9, 0.9, 1);
            mesh.add(journey.glow);
            follow.hero = journey;
          }
          enterStep(journey);
          journeys.push(journey);
        };

        const flashModule = (key) => { moduleNodes[key].flash = 0.3; };

        // Depois de recebida (Sync ou E3), a informação é gravada no banco e aparece no Sigma ECM
        const saveAndShowSteps = (kind) => {
          const db = net.activeDb;
          return [
            {
              path: arcDb[db], dir: 1, kind,
              done: (time) => { net.saved += 1; net.savedBucket += 1; logEvent(time, `gravado: ${DB_NAMES[db]}`); }
            },
            { path: arcSigma[db], dir: 1, kind, scale: 1.0, done: () => { net.shown += 1; } }
          ];
        };

        const sendSync = (key) => {
          startJourney([
            { path: arcModule[key], dir: 1, kind: 'msg', done: () => flashModule(key) },
            { path: arcLink, dir: 1, kind: 'msg' },
            {
              path: arcQueueIn, dir: 1, kind: 'msg',
              done: (time) => {
                net.depth = Math.min(net.depth + 1, 99);
                net.received += 1;
                net.recvBucket += 1;
                logEvent(time, `${moduleLabels[key]} enviou (Sync)`);
              }
            }
          ]);
        };

        const consumeQueue = () => {
          net.depth -= 1;
          startJourney([
            { path: arcQueueOut, dir: 1, kind: 'msg', done: (time) => { net.flash = 0.25; logEvent(time, 'Sigma tirou da fila'); } },
            ...saveAndShowSteps('msg')
          ]);
        };

        // O pacote "herói" é o que a câmera acompanha no tour: mais lento, maior e com uma etapa (`stage`) em cada trecho
        const HERO_SPEED = 6;
        const HERO_LINK_SPEED = 11;
        const HERO_SLOW_SPEED = 3.5;
        // `plan` é uma lista de [trecho, etapa, velocidade opcional]; as pausas (`hold`) mostram a tela do boneco mexendo
        const heroize = (plan) => plan.map(([step, stage, speed]) => ({ ...step, stage, speed: speed || step.speed || HERO_SPEED, scale: 3 }));
        const holdAt = (point, seconds, extra = {}) => ({
          path: { points: [point, point], lengths: [seconds], length: seconds }, dir: 1, speed: 1, ...extra
        });
        const panelView = () => {
          const y = treetechRoof.panelY();
          return { pos: new THREE.Vector3(52, y + 1.65, 17.5), target: new THREE.Vector3(52, y - 0.95, 5.7) };
        };

        const pollE3 = (key) => {
          const steps = [
            { path: arcServer, dir: -1, kind: 'query' },
            { path: arcLink, dir: -1, kind: 'query' },
            {
              path: arcModule[key], dir: -1, kind: 'query',
              done: (time) => { flashModule(key); logEvent(time, `Sigma consultou ${moduleLabels[key]} (E3)`); }
            },
            { path: arcModule[key], dir: 1, kind: 'answer' },
            { path: arcLink, dir: 1, kind: 'answer' },
            {
              path: arcServer, dir: 1, kind: 'answer',
              done: () => { net.flash = 0.25; net.received += 1; net.recvBucket += 1; }
            },
            ...saveAndShowSteps('answer')
          ];
          startJourney(steps);
        };

        // E3 do herói: pergunta até o módulo, resposta de volta, banco e painel, com uma pausa em cada ponto importante
        const pollE3Hero = (key) => {
          const db = net.activeDb;
          const kind = 'answer';
          startJourney(heroize([
            [{ path: arcServer, dir: -1, kind: 'query' }, 0],
            [{ path: arcLink, dir: -1, kind: 'query' }, 1, HERO_LINK_SPEED],
            [{
              path: arcModule[key], dir: -1, kind: 'query',
              done: (time) => { flashModule(key); logEvent(time, `Sigma consultou ${moduleLabels[key]} (E3)`); }
            }, 1],
            [holdAt(moduleNodes[key].top, 2.2, { kind: 'query' }), 2],
            [{ path: arcModule[key], dir: 1, kind }, 2],
            [{ path: arcLink, dir: 1, kind }, 3, HERO_LINK_SPEED],
            [{
              path: arcServer, dir: 1, kind,
              done: () => { net.flash = 0.25; net.received += 1; net.recvBucket += 1; }
            }, 3],
            [holdAt(serverTop, 2, { kind }), 3],
            [{
              path: arcDb[db], dir: 1, kind,
              done: (time) => { net.saved += 1; net.savedBucket += 1; logEvent(time, `gravado: ${DB_NAMES[db]}`); }
            }, 4, HERO_SLOW_SPEED],
            [{ path: arcSigma[db], dir: 1, kind, done: () => { net.shown += 1; }, view: panelView }, 5, HERO_SLOW_SPEED],
            [holdAt(dashboardPoint, 7, { kind, view: panelView }), 5]
          ]), true);
        };

        // Sync do herói: a mensagem espera um tempo na fila antes de o Sigma retirá-la
        const sendSyncHero = (key) => {
          const db = net.activeDb;
          const kind = 'msg';
          startJourney(heroize([
            [{ path: arcModule[key], dir: 1, kind, done: () => flashModule(key) }, 0],
            [{ path: arcLink, dir: 1, kind }, 1, HERO_LINK_SPEED],
            [{
              path: arcQueueIn, dir: 1, kind,
              done: (time) => {
                net.depth = Math.min(net.depth + 1, 99);
                net.received += 1;
                net.recvBucket += 1;
                logEvent(time, `${moduleLabels[key]} enviou (Sync)`);
              }
            }, 1],
            [holdAt(queueTop, 4, { kind, done: () => { net.depth = Math.max(0, net.depth - 1); } }), 2],
            [{ path: arcQueueOut, dir: 1, kind, done: (time) => { net.flash = 0.25; logEvent(time, 'Sigma tirou da fila'); } }, 3, HERO_SLOW_SPEED],
            [holdAt(serverTop, 1.5, { kind }), 3],
            [{
              path: arcDb[db], dir: 1, kind,
              done: (time) => { net.saved += 1; net.savedBucket += 1; logEvent(time, `gravado: ${DB_NAMES[db]}`); }
            }, 4, HERO_SLOW_SPEED],
            [{ path: arcSigma[db], dir: 1, kind, done: () => { net.shown += 1; }, view: panelView }, 5, HERO_SLOW_SPEED],
            [holdAt(dashboardPoint, 7, { kind, view: panelView }), 5]
          ]), true);
        };

        const userSession = (cable) => {
          startJourney([
            { path: cable, dir: 1, kind: 'query', scale: 1, speed: 6 },
            {
              path: cable, dir: -1, kind: 'answer', scale: 1, speed: 6,
              done: (time) => logEvent(time, `${cable.label} abriu o Sigma ECM`)
            }
          ]);
        };

        const FOLLOW_BACK = 12;
        const FOLLOW_UP = 4;
        const followWish = new THREE.Vector3();
        const followDir = new THREE.Vector3();

        const setFlowStage = (stage) => {
          if (follow.stage === stage) return;
          follow.stage = stage;
          if (flowUiRef.current) flowUiRef.current(stage < 0 ? null : { mode: follow.mode, stage });
        };

        // Direção (no plano) em que o pacote sai no começo de um trecho
        const stepHeading = (step) => {
          const p = step.path.points;
          const n = p.length;
          const from = step.dir > 0 ? p[0] : p[n - 1];
          const to = step.dir > 0 ? p[Math.min(4, n - 1)] : p[Math.max(n - 5, 0)];
          followDir.set(to.x - from.x, 0, to.z - from.z);
          if (followDir.lengthSq() > 1e-6) follow.heading.copy(followDir.normalize());
        };

        // Entre um pacote e outro a câmera espera no ponto de partida do próximo
        const prepareNextHero = () => {
          const key = moduleKeys[follow.keyIndex % moduleKeys.length];
          if (follow.mode === 'e3') {
            follow.anchor.copy(serverTop);
            follow.heading.set(0, 0, -1);
          } else {
            follow.anchor.copy(moduleNodes[key].top);
            stepHeading({ path: arcModule[key], dir: 1 });
          }
        };

        const launchHero = () => {
          const key = moduleKeys[follow.keyIndex % moduleKeys.length];
          follow.keyIndex += 1;
          setFlowStage(0);
          if (follow.mode === 'e3') pollE3Hero(key);
          else sendSyncHero(key);
          const first = follow.hero.steps[0];
          follow.hero.mesh.position.copy(cablePoint(first.path, follow.hero.dist));
          follow.prev.copy(follow.hero.mesh.position);
          if (follow.mode === 'sync') stepHeading(first);
        };

        const endHero = (time) => {
          follow.hero = null;
          follow.nextHero = time + 2.4;
          prepareNextHero();
          if (heroDoneRef.current) heroDoneRef.current();
        };

        const updateFollow = (dt) => {
          if (!follow.mode) return;
          let target = follow.hero ? follow.hero.mesh.position : follow.anchor;
          const view = follow.hero && follow.hero.steps[follow.hero.index].view;
          if (view) {
            const shot = view();
            const k = 1 - Math.exp(-dt * 2);
            controls.target.lerp(shot.target, k);
            camera.position.lerp(shot.pos, k);
            follow.prev.copy(follow.hero.mesh.position);
            return;
          }
          if (follow.hero) {
            followDir.set(target.x - follow.prev.x, 0, target.z - follow.prev.z);
            if (followDir.lengthSq() > 1e-5) {
              followDir.normalize();
              follow.heading.lerp(followDir, Math.min(1, dt * 3));
              if (follow.heading.lengthSq() < 1e-3) follow.heading.copy(followDir);
              follow.heading.normalize();
            }
            follow.prev.copy(target);
          }
          followWish.copy(target).addScaledVector(follow.heading, -FOLLOW_BACK);
          followWish.y = Math.max(target.y + FOLLOW_UP, 3);
          const k = 1 - Math.exp(-dt * 3);
          controls.target.lerp(target, k);
          camera.position.lerp(followWish, k);
        };
