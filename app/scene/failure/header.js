          const FAIL_SECONDS = 20;
          const INTRO = 5.5;
          const RESTORE_SECONDS = 19;
          const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
          const rnd = (a, b) => a + Math.random() * (b - a);
          const ss = (a, b, x) => {
            const q = Math.min(1, Math.max(0, (x - a) / (b - a)));
            return q * q * (3 - 2 * q);
          };
          const root = new THREE.Group();
          scene.add(root);
          const trafoGroup = componentMeshesRef.current['transformer'];
          const ALERTS = [
            'Temperatura do óleo acima de 95 ºC (TM)',
            'Gases dissolvidos críticos no óleo (GMP)',
            'Descarga parcial nas buchas AT (BM)',
            'Proteção diferencial 87T atuada',
            'Pressão do tanque acima do limite',
            'Ventilação forçada esgotada: risco de explosão'
          ];
          const ISO_POS = V3(22, 18, 22);
          const ISO_TARGET = V3(0, 2.5, 0);
          const st = { beaconsOn: false, phase: 'idle', t: 0, te: 0, tr: 0, last: 0, shake: 0, lastRem: -1, lastAlert: -1, mqNext: 0, mqSnap: null, spark: 0, smoke: 0, dust: 0, breakerDone: false, restoreBreaker: false, cam: null, screensBack: false, knockReleased: false };
          const shake = V3(0, 0, 0);
          const AERIAL_POS = V3(54, 104, -4);
          const AERIAL_TARGET = V3(54, 0, -18.5);
          const RESTORE_SHOTS = [
            { until: 3, pos: V3(12, 9, 13), tgt: V3(0, 1.5, 0) },
            { until: 6.5, pos: V3(7.5, 5.2, 8.5), tgt: V3(0, 2.2, 0) },
            { until: 11, pos: V3(37, 17, 20), tgt: V3(18.5, 2.5, 2.5) },
            { until: 999, pos: AERIAL_POS, tgt: AERIAL_TARGET }
          ];
