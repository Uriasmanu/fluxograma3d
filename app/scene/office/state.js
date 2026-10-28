        // 9b. EQUIPE DE SOFTWARE DA TREETECH: pessoas detalhadas, telas animadas e cantinhos de café
        const officeLife = { update: null, obstacles: [], persons: [], coffee: [], tickers: [], debug: {} };
        const failureSim = {
          active: false, exploded: false, mode: 'normal', waveR: 0, elapsed: 0, mqTexture: null,
          lit: (x, z) => {
            const m = failureSim.mode;
            if (m === 'dark') return Math.hypot(x, z) >= failureSim.waveR;
            if (m === 'restore') return Math.hypot(x, z) < failureSim.waveR;
            return true;
          },
          alerts: [
            'Temperatura do óleo acima de 95 ºC (TM)',
            'Gases dissolvidos críticos (GMP)',
            'Descarga parcial nas buchas AT (BM)',
            'Proteção diferencial 87T atuada',
            'Pressão do tanque acima do limite',
            'Ventilação forçada esgotada'
          ],
          remaining: 20,
          paintDashboard: (ctx, W, H, time) => {
            ctx.save();
            failureSim.dashboardRaw(ctx, W, H, time);
            ctx.restore();
          },
          dashboardRaw: (ctx, W, H, time) => {
            const tw = W / 4;
            const th = H / 2;
            const on = Math.floor(time * 2.5) % 2 === 0;
            const el = failureSim.elapsed;
            ctx.fillStyle = '#120406';
            ctx.fillRect(0, 0, W, H);
            for (let i = 0; i < 8; i++) {
              const col = i % 4;
              const row = Math.floor(i / 4);
              const hot = (i + (on ? 1 : 0)) % 2 === 0;
              ctx.fillStyle = hot ? '#5a0b0b' : '#2a0707';
              ctx.fillRect(col * tw + 5, row * th + 5, tw - 10, th - 10);
            }
            ctx.textBaseline = 'top';
            ctx.textAlign = 'left';
            const title = (text, col, row) => {
              ctx.fillStyle = '#ffb4b4';
              ctx.font = 'bold 24px Arial, sans-serif';
              ctx.fillText(text, col * tw + 28, row * th + 22);
            };
            const big = (text, col, row, size, color, dy = 70) => {
              ctx.fillStyle = color;
              ctx.font = 'bold ' + size + 'px Arial, sans-serif';
              ctx.fillText(text, col * tw + 28, row * th + dy);
            };
            title('SIGMA ECM  |  COMUNICAÇÃO', 0, 0);
            big('Sync', 0, 0, 120, on ? '#ff3030' : '#ffffff');
            big('ALERTA CRÍTICO', 0, 0, 34, '#ffd0d0', 215);
            title('TM  ·  TEMPERATURA', 1, 0);
            big(Math.min(140, Math.round(78 + el * 1.1)) + ' ºC', 1, 0, 96, '#ff4a4a', 90);
            title('GMP  ·  GÁS NO ÓLEO', 2, 0);
            big(Math.round(300 + el * 70) + ' ppm', 2, 0, 76, '#ff7a3a', 100);
            title('BM  ·  BUCHAS', 3, 0);
            big('DESCARGA', 3, 0, 56, '#ff4a4a', 90);
            big('PARCIAL', 3, 0, 56, '#ff4a4a', 150);
            title('ALERTAS', 0, 1);
            const start = Math.floor(time / 1.2) % failureSim.alerts.length;
            for (let i = 0; i < 4; i++) {
              const text = failureSim.alerts[(start + i) % failureSim.alerts.length];
              ctx.fillStyle = i === 0 ? '#ffffff' : '#ffb0b0';
              ctx.font = (i === 0 ? 'bold ' : '') + '25px Arial, sans-serif';
              ctx.fillText('⚠ ' + text.slice(0, 33), 28, th + 66 + i * 52);
            }
            title('PROTEÇÃO 87T', 1, 1);
            big('ATUADA', 1, 1, 80, '#ff4a4a', 90);
            title('TRAFO 01', 2, 1);
            big('SOBREAQUECIMENTO', 2, 1, 44, '#ffd0d0', 80);
            ctx.fillStyle = '#3a0a0a';
            ctx.fillRect(2 * tw + 28, th + 170, tw - 56, 26);
            ctx.fillStyle = on ? '#ff3030' : '#ff8a3a';
            ctx.fillRect(2 * tw + 28, th + 170, (tw - 56) * Math.min(1, el / 60), 26);
            title('EXPLOSÃO EM', 3, 1);
            const rem = Math.max(0, Math.ceil(failureSim.remaining));
            big('0:' + String(rem).padStart(2, '0'), 3, 1, 110, on ? '#ffffff' : '#ff3030', 90);
          },
          paintAlert: (ctx, w, h, time) => {
            ctx.save();
            failureSim.alertRaw(ctx, w, h, time);
            ctx.restore();
          },
          alertRaw: (ctx, w, h, time) => {
            const u = h / 200;
            const dead = failureSim.exploded;
            const on = Math.floor(time * 2.5) % 2 === 0;
            ctx.fillStyle = dead ? (on ? '#2a0a0a' : '#0a0505') : (on ? '#a80c0c' : '#2a0606');
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = dead ? '#3a1010' : (on ? '#ffd23f' : '#5a0000');
            for (let x = -h; x < w + h; x += 30 * u) {
              [0, h - 12 * u].forEach(y => {
                ctx.beginPath();
                ctx.moveTo(x, y + 12 * u);
                ctx.lineTo(x + 14 * u, y);
                ctx.lineTo(x + 28 * u, y);
                ctx.lineTo(x + 14 * u, y + 12 * u);
                ctx.fill();
              });
            }
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = dead ? '#6a3a3a' : '#ffffff';
            ctx.beginPath();
            ctx.moveTo(w / 2, 22 * u);
            ctx.lineTo(w / 2 + 34 * u, 82 * u);
            ctx.lineTo(w / 2 - 34 * u, 82 * u);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = dead ? '#0a0505' : '#a80c0c';
            ctx.font = 'bold ' + 40 * u + 'px Arial, sans-serif';
            ctx.fillText('!', w / 2, 62 * u);
            ctx.fillStyle = dead ? '#9a6a6a' : '#ffffff';
            ctx.font = 'bold ' + 22 * u + 'px Arial, sans-serif';
            ctx.fillText(dead ? 'SEM SINAL' : 'ALARME CRÍTICO', w / 2, 102 * u);
            ctx.font = 'bold ' + 12 * u + 'px Arial, sans-serif';
            const el = failureSim.elapsed;
            const lines = dead
              ? ['TRAFO 01 FORA DE OPERAÇÃO', 'COMUNICAÇÃO PERDIDA COM OS MÓDULOS']
              : ['TRAFO 01 · SOBRETEMPERATURA ' + Math.min(140, Math.round(78 + el * 1.1)) + ' ºC', 'GMP: H2 ' + Math.round(300 + el * 70) + ' ppm · BM: DESCARGA PARCIAL'];
            ctx.fillText(lines[0], w / 2, 128 * u);
            ctx.fillText(lines[1], w / 2, 146 * u);
          }
        };
