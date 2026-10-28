          // ---------- Telas animadas dos PCs ----------
          const CODE_LINES = [
            "import amqp from 'amqplib';",
            "import { decode } from './frames';",
            '',
            'export async function consume(queue: string) {',
            '  const conn = await amqp.connect(process.env.MQ_URL);',
            '  const ch = await conn.createChannel();',
            '  await ch.assertQueue(queue, { durable: true });',
            '  ch.consume(queue, async (msg) => {',
            '    if (!msg) return;',
            '    const frame = decode(msg.content);',
            '    // grava a leitura do módulo TM',
            '    await saveReading(frame.moduleId, frame.temp);',
            '    if (frame.temp > 95) notifyAlarm(frame);',
            '    ch.ack(msg);',
            '  });',
            '}',
            '',
            'export const MODULES = [',
            "  { id: 'tm', label: 'TM', unit: 'ºC' },",
            "  { id: 'bm', label: 'BM', unit: 'pF' },",
            "  { id: 'gmp', label: 'GMP', unit: 'ppm' },",
            '];'
          ];
          const KEYWORDS = new Set(['import', 'from', 'export', 'async', 'await', 'const', 'function', 'return', 'if', 'new']);
          const tokenRe = /(\/\/.*$)|('[^']*'|"[^"]*"|`[^`]*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|(\s+)|(.)/g;
          const SQL_KEYWORDS = new Set(['INSERT', 'INTO', 'VALUES', 'SELECT', 'FROM', 'WHERE', 'UPDATE', 'SET']);
          const drawCodeLine = (ctx, line, x, y, cw, keywords = KEYWORDS) => {
            tokenRe.lastIndex = 0;
            let m;
            let cx = x;
            while ((m = tokenRe.exec(line)) !== null) {
              const tok = m[0];
              if (m[1]) ctx.fillStyle = '#6a7a86';
              else if (m[2]) ctx.fillStyle = '#9ccf84';
              else if (m[3]) ctx.fillStyle = '#e8a35a';
              else if (m[4]) ctx.fillStyle = keywords.has(tok) ? '#c792ea' : (line[m.index + tok.length] === '(' ? '#82aaff' : '#d6dde3');
              else ctx.fillStyle = '#9aa7b2';
              if (!m[5]) ctx.fillText(tok, cx, y);
              cx += tok.length * cw;
            }
          };
          const SCREEN_W = 320;
          const SCREEN_H = 200;
          const screenPainters = {
            code: (ctx, time, seed) => {
              ctx.fillStyle = '#1b2127';
              ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
              ctx.fillStyle = '#232b33';
              ctx.fillRect(0, 0, 62, SCREEN_H);
              ctx.font = '9px monospace';
              ctx.textBaseline = 'middle';
              ['src', '  mq', '   consume.ts', '   frames.ts', '  api', '  db', 'package.json'].forEach((name, i) => {
                ctx.fillStyle = i === 2 ? '#e8ecef' : '#7c8a96';
                ctx.fillText(name, 5, 22 + i * 13);
              });
              ctx.fillStyle = '#10151a';
              ctx.fillRect(62, 0, SCREEN_W - 62, 16);
              ctx.fillStyle = '#1b2127';
              ctx.fillRect(64, 2, 70, 14);
              ctx.fillStyle = '#e8ecef';
              ctx.fillText('consume.ts', 70, 9);
              ctx.fillStyle = GREEN;
              ctx.fillRect(64, 15, 70, 1.5);

              const cw = 5.6;
              ctx.font = '9.5px monospace';
              const typed = Math.floor(time * 6 + seed * 20);
              const cycle = CODE_LINES.reduce((sum, l) => sum + l.length + 8, 0);
              let remaining = typed % cycle;
              const loops = Math.floor(typed / cycle);
              let n = 0;
              while (n < CODE_LINES.length && remaining >= CODE_LINES[n].length + 8) {
                remaining -= CODE_LINES[n].length + 8;
                n += 1;
              }
              const partial = n < CODE_LINES.length ? CODE_LINES[n].slice(0, Math.min(remaining, CODE_LINES[n].length)) : '';
              const rows = [];
              for (let i = Math.max(0, n - 12); i < n; i++) rows.push(CODE_LINES[i]);
              rows.push(partial);
              rows.forEach((line, i) => {
                const y = 28 + i * 12;
                ctx.fillStyle = '#4a5662';
                ctx.fillText(String(loops * 3 + Math.max(0, n - 12) + i + 1).padStart(2, ' '), 68, y);
                drawCodeLine(ctx, line, 88, y, cw);
              });
              if (Math.floor(time * 2) % 2 === 0) {
                ctx.fillStyle = '#e8ecef';
                ctx.fillRect(88 + partial.length * cw, 28 + (rows.length - 1) * 12 - 5, 1.5, 10);
              }
              ctx.fillStyle = '#2d6a4f';
              ctx.fillRect(0, SCREEN_H - 14, SCREEN_W, 14);
              ctx.fillStyle = '#e8ecef';
              ctx.font = '9px monospace';
              ctx.fillText('main   Ln ' + (n + 1) + ', Col ' + (partial.length + 1) + '   TypeScript   UTF-8', 6, SCREEN_H - 7);
            },
            term: (ctx, time, seed) => {
              ctx.fillStyle = '#10151a';
              ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
              ctx.fillStyle = '#232b33';
              ctx.fillRect(0, 0, SCREEN_W, 14);
              ctx.fillStyle = '#9aa7b2';
              ctx.font = '9px monospace';
              ctx.textBaseline = 'middle';
              ctx.fillText('terminal - zsh', 8, 7);
              const feed = [
                ['$ npm run test', '#6fdf8a'],
                [' PASS  src/mq/consume.test.ts', '#9ccf84'],
                [' PASS  src/frames.test.ts', '#9ccf84'],
                ['   ✓ decodifica quadro do TM (4 ms)', '#9aa7b2'],
                ['   ✓ ignora mensagem vazia (1 ms)', '#9aa7b2'],
                [' WARN  fila sync com 3 mensagens', '#f0c75e'],
                ['Tests: 128 passed, 128 total', '#e8ecef'],
                ['$ docker compose up rabbitmq', '#6fdf8a'],
                ['[mq] broker online porta 5672', '#82aaff'],
                ['[sync] módulo GMP conectado', '#82aaff'],
                ['$ git push origin feat/sync', '#6fdf8a'],
                ['remote: build #482 em andamento', '#9aa7b2']
              ];
              const count = Math.floor(time * 1.4 + seed * 12);
              for (let i = 0; i < 14; i++) {
                const idx = count - 13 + i;
                if (idx < 0) continue;
                const [text, color] = feed[idx % feed.length];
                ctx.fillStyle = color;
                ctx.fillText(text.slice(0, 54), 8, 26 + i * 12);
              }
              const prog = (time * 0.2 + seed) % 1;
              ctx.fillStyle = '#232b33';
              ctx.fillRect(8, SCREEN_H - 14, 200, 6);
              ctx.fillStyle = GREEN;
              ctx.fillRect(8, SCREEN_H - 14, 200 * prog, 6);
              ctx.fillStyle = '#9aa7b2';
              ctx.fillText(Math.floor(prog * 100) + '%', 214, SCREEN_H - 11);
            },
            dash: (ctx, time, seed) => {
              ctx.fillStyle = '#eef2f5';
              ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
              ctx.fillStyle = '#d6dde3';
              ctx.fillRect(0, 0, SCREEN_W, 16);
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(40, 3, 200, 10);
              ctx.fillStyle = '#5b6772';
              ctx.font = '8px monospace';
              ctx.textBaseline = 'middle';
              ctx.fillText('sigma.treetech.local/trafo-01', 46, 8);
              ctx.fillStyle = GREEN;
              ctx.fillRect(0, 16, SCREEN_W, 18);
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 11px Arial, sans-serif';
              ctx.fillText('Sigma ECM  ·  Trafo 01', 8, 25);
              [['TM', 58 + Math.sin(time * 0.7 + seed) * 3, 'ºC'], ['BM', 12.4 + Math.sin(time * 0.5) * 0.3, 'pF'], ['GMP', 18 + Math.sin(time * 0.4 + 1) * 2, 'ppm'], ['DM', 3, 'op.']].forEach(([label, value, unit], i) => {
                const x = 8 + i * 77;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x, 42, 70, 42);
                ctx.fillStyle = '#5b6772';
                ctx.font = '9px Arial, sans-serif';
                ctx.fillText(label, x + 6, 52);
                ctx.fillStyle = '#2b323a';
                ctx.font = 'bold 15px Arial, sans-serif';
                ctx.fillText((label === 'DM' ? value : value.toFixed(1)) + '', x + 6, 68);
                ctx.fillStyle = '#9aa7b2';
                ctx.font = '8px Arial, sans-serif';
                ctx.fillText(unit, x + 48, 76);
              });
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(8, 92, 304, 100);
              ctx.strokeStyle = '#e1e6ea';
              ctx.lineWidth = 1;
              for (let g = 0; g < 4; g++) {
                ctx.beginPath();
                ctx.moveTo(14, 104 + g * 22);
                ctx.lineTo(306, 104 + g * 22);
                ctx.stroke();
              }
              [[GREEN, 0, 1], ['#d9783a', 2, 0.6]].forEach(([color, phase, amp]) => {
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                for (let i = 0; i <= 58; i++) {
                  const t = time * 1.2 - (58 - i) * 0.12;
                  const y = 148 - (Math.sin(t * 0.9 + phase + seed) * 22 + Math.sin(t * 2.3 + phase) * 6) * amp;
                  if (i === 0) ctx.moveTo(14, y);
                  else ctx.lineTo(14 + i * 5.03, y);
                }
                ctx.stroke();
              });
            },
            git: (ctx, time, seed) => {
              ctx.fillStyle = '#0d1117';
              ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
              ctx.fillStyle = '#161b22';
              ctx.fillRect(0, 0, SCREEN_W, 30);
              ctx.fillStyle = '#e6edf3';
              ctx.font = 'bold 10px Arial, sans-serif';
              ctx.textBaseline = 'middle';
              ctx.fillText('feat: fila sync do RabbitMQ  #482', 8, 11);
              ctx.fillStyle = '#6fdf8a';
              ctx.font = '9px Arial, sans-serif';
              ctx.fillText('✓ build   ✓ testes   ✓ lint   ● 2 revisões', 8, 23);
              const diff = [
                ['@@ -42,7 +42,9 @@ consume()', 'h'],
                ['   const frame = decode(msg.content);', ' '],
                ['-  await saveReading(frame);', '-'],
                ['+  await saveReading(frame.moduleId,', '+'],
                ['+                    frame.temp);', '+'],
                ['   ch.ack(msg);', ' '],
                ['@@ -88,4 +90,6 @@ sync()', 'h'],
                ['-  retry(3);', '-'],
                ['+  retry(5, { backoff: 200 });', '+'],
                ['+  logger.info("sync ok");', '+'],
                ['   return true;', ' ']
              ];
              ctx.font = '9px monospace';
              const off = Math.floor(time * 0.8 + seed * 5);
              for (let i = 0; i < 13; i++) {
                const [text, kind] = diff[(i + off) % diff.length];
                const y = 36 + i * 12;
                if (kind === '+') ctx.fillStyle = '#12351f';
                else if (kind === '-') ctx.fillStyle = '#3a1618';
                else if (kind === 'h') ctx.fillStyle = '#1b2a41';
                else ctx.fillStyle = '#0d1117';
                ctx.fillRect(0, y - 6, SCREEN_W, 12);
                ctx.fillStyle = kind === '+' ? '#7ee787' : kind === '-' ? '#ff7b72' : kind === 'h' ? '#79c0ff' : '#c9d1d9';
                ctx.fillText(text.slice(0, 52), 8, y);
              }
            },
            chat: (ctx, time, seed) => {
              ctx.fillStyle = '#f4f7f5';
              ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
              ctx.fillStyle = '#4a154b';
              ctx.fillRect(0, 0, SCREEN_W, 22);
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 11px Arial, sans-serif';
              ctx.textBaseline = 'middle';
              ctx.fillText('# time-software', 10, 11);
              const msgs = [['Ana', 'subi o PR da fila sync', '#2f9e5e'], ['Caio', 'revisando agora', '#5b8fc0'], ['Bia', 'build passou ✓', '#d9783a'], ['Caio', 'quem vai no café?', '#5b8fc0'], ['Ana', 'eu! ☕', '#2f9e5e']];
              const shown = 1 + Math.floor((time * 0.35 + seed * 3) % msgs.length);
              for (let i = 0; i < shown; i++) {
                const [who, text, color] = msgs[i];
                const y = 36 + i * 32;
                ctx.fillStyle = color;
                ctx.fillRect(10, y - 4, 20, 20);
                ctx.fillStyle = '#2b323a';
                ctx.font = 'bold 10px Arial, sans-serif';
                ctx.fillText(who, 38, y);
                ctx.font = '10px Arial, sans-serif';
                ctx.fillText(text, 38, y + 13);
              }
              const dots = Math.floor(time * 3) % 4;
              ctx.fillStyle = '#9aa7b2';
              ctx.fillText('digitando' + '.'.repeat(dots), 10, SCREEN_H - 10);
            },
            config: (ctx, time, seed) => {
              const PERIOD = 7;
              const t = time + seed * 3 * PERIOD;
              const scene = Math.floor(t / PERIOD) % 3;
              const local = t % PERIOD;
              const accent = ['#6fdf8a', '#5b9bf0', '#f0983a'][scene];
              ctx.fillStyle = '#10151a';
              ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
              ctx.fillStyle = '#1b2229';
              ctx.fillRect(0, 0, SCREEN_W, 20);
              ctx.textBaseline = 'middle';
              ctx.font = 'bold 12px Arial, sans-serif';
              ['Script', 'E3', 'Sync'].forEach((name, i) => {
                const x = 6 + i * 62;
                ctx.fillStyle = i === scene ? '#10151a' : '#1b2229';
                ctx.fillRect(x, 3, 58, 17);
                ctx.fillStyle = i === scene ? accent : '#7c8a96';
                ctx.fillText(name, x + 8, 12);
                if (i === scene) {
                  ctx.fillStyle = accent;
                  ctx.fillRect(x, 18, 58, 2);
                }
              });
              ctx.font = '11px Arial, sans-serif';
              ctx.fillStyle = '#7c8a96';
              ctx.textAlign = 'right';
              ctx.fillText('módulo TM', SCREEN_W - 8, 11);
              ctx.textAlign = 'left';

              const field = (label, value, y) => {
                ctx.font = '11px Arial, sans-serif';
                ctx.fillStyle = '#9aa7b2';
                ctx.fillText(label, 10, y);
                ctx.fillStyle = '#1b2229';
                ctx.fillRect(78, y - 8, 160, 16);
                ctx.fillStyle = '#e8ecef';
                ctx.font = '11px monospace';
                ctx.fillText(value, 84, y);
              };
              const statusBar = (left, right, color) => {
                ctx.fillStyle = color;
                ctx.fillRect(0, SCREEN_H - 16, SCREEN_W, 16);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 10px Arial, sans-serif';
                ctx.fillText(left, 8, SCREEN_H - 8);
                ctx.textAlign = 'right';
                ctx.fillText(right, SCREEN_W - 8, SCREEN_H - 8);
                ctx.textAlign = 'left';
              };

              if (scene === 0) {
                const SQL = [
                  '-- mapeamento do módulo TM',
                  'INSERT INTO ponto (tag, un)',
                  "VALUES ('TEMP_OLEO', 'ºC'),",
                  "       ('CARGA', 'A');",
                  "SELECT validar('TM');"
                ];
                ctx.font = '11px monospace';
                let remaining = Math.floor(local * 28);
                const total = SQL.reduce((sum, line) => sum + line.length, 0);
                let cursorX = 24;
                let cursorY = 36;
                SQL.forEach((line, i) => {
                  const y = 38 + i * 18;
                  const shown = line.slice(0, Math.max(0, Math.min(line.length, remaining)));
                  ctx.fillStyle = '#4a5662';
                  ctx.fillText(String(i + 1), 8, y);
                  if (line.startsWith('--')) {
                    ctx.fillStyle = '#6a7a86';
                    ctx.fillText(shown, 24, y);
                  } else {
                    drawCodeLine(ctx, shown, 24, y, 6.6, SQL_KEYWORDS);
                  }
                  if (remaining >= 0 && remaining <= line.length) {
                    cursorX = 24 + shown.length * 6.6;
                    cursorY = y;
                  }
                  remaining -= line.length;
                });
                if (Math.floor(time * 2) % 2 === 0) {
                  ctx.fillStyle = '#e8ecef';
                  ctx.fillRect(cursorX, cursorY - 6, 1.5, 12);
                }
                const done = Math.floor(local * 28) >= total;
                statusBar(done ? '✓ mapeamento validado · 2 pontos' : 'mapeamento_tm.sql · digitando…', 'SQL', done ? '#2d6a4f' : '#232b33');
              } else if (scene === 1) {
                field('Modo', 'consulta (polling)', 36);
                field('Endereço', '192.168.10.41', 56);
                field('Porta', '5000', 76);
                field('Intervalo', '1,4 s', 96);
                const pressed = local > 0.5 && local < 0.9;
                ctx.fillStyle = pressed ? accent : '#232b33';
                ctx.fillRect(250, 28, 62, 20);
                ctx.fillStyle = pressed ? '#10151a' : '#e8ecef';
                ctx.font = 'bold 11px Arial, sans-serif';
                ctx.fillText('Testar', 264, 38);
                const log = [
                  [1.0, '→ pergunta: há dados novos?', '#7db8ff'],
                  [2.4, '← resposta: 2 pontos em 12 ms', '#6fdf8a'],
                  [3.8, '✓ módulo TM respondeu', '#e8ecef']
                ];
                ctx.font = '11px monospace';
                log.forEach(([at, text, color], i) => {
                  if (local < at) return;
                  ctx.fillStyle = color;
                  ctx.fillText(text, 12, 128 + i * 18);
                });
                statusBar('E3 · Sigma consulta o módulo', local > 3.8 ? 'conectado' : 'aguardando', '#1f4e8c');
              } else {
                field('Broker', 'rabbitmq:5672', 36);
                field('Fila', 'sync.tm', 56);
                field('Envio', 'a cada 3 a 7 s', 76);
                const value = (62 + 3 * Math.sin(time * 0.6 + seed * 5)).toFixed(1);
                const json = [
                  ['{', '#9aa7b2'],
                  ['  "modulo": "TM",', '#9ccf84'],
                  ['  "ponto": "TEMP_OLEO",', '#9ccf84'],
                  ['  "valor": ' + value, '#f0983a'],
                  ['}', '#9aa7b2']
                ];
                ctx.fillStyle = '#0d1117';
                ctx.fillRect(10, 92, SCREEN_W - 20, 84);
                ctx.font = '11px monospace';
                json.forEach(([text, color], i) => {
                  ctx.fillStyle = color;
                  ctx.fillText(text, 18, 104 + i * 15);
                });
                const sent = Math.floor(t / 4.5);
                statusBar('Sync · módulo publica na fila', (Math.floor(time * 2) % 2 === 0 ? '● ' : '○ ') + sent % 1000 + ' enviadas', '#a8622a');
              }

              if (local < 0.5) {
                ctx.fillStyle = 'rgba(255,255,255,' + (0.55 * (1 - local / 0.5)).toFixed(2) + ')';
                ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
              }
            },
            ops: (ctx, time, seed) => {
              ctx.fillStyle = '#10181f';
              ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
              ctx.fillStyle = '#16222c';
              ctx.fillRect(0, 0, SCREEN_W, 20);
              ctx.fillStyle = '#e8ecef';
              ctx.font = 'bold 10px Arial, sans-serif';
              ctx.textBaseline = 'middle';
              ctx.fillText('Monitoramento · módulos Treetech', 8, 10);
              const alarm = Math.floor(time / 6 + seed * 3) % 4 === 3;
              ctx.fillStyle = alarm && Math.floor(time * 3) % 2 === 0 ? '#d9534f' : '#2d6a4f';
              ctx.fillRect(SCREEN_W - 70, 4, 62, 12);
              ctx.fillStyle = '#ffffff';
              ctx.font = '8px Arial, sans-serif';
              ctx.fillText(alarm ? 'ALARME' : 'NORMAL', SCREEN_W - 62, 10);
              const rows = [['TM  trafo 01', 58], ['BM  buchas', 12], ['GMP óleo', 18], ['DM  disj. 1', 3], ['DM  disj. 2', 4], ['TM  trafo 02', 61], ['GMP trafo 02', 21]];
              rows.forEach(([label, base], i) => {
                const y = 36 + i * 22;
                const warn = alarm && i === 5;
                ctx.fillStyle = i % 2 ? '#131d25' : '#16222c';
                ctx.fillRect(6, y - 9, SCREEN_W - 12, 20);
                ctx.fillStyle = warn ? '#d9534f' : '#6fdf8a';
                ctx.beginPath();
                ctx.arc(16, y + 1, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#c9d1d9';
                ctx.font = '10px Arial, sans-serif';
                ctx.fillText(label, 28, y + 1);
                ctx.fillStyle = '#82aaff';
                ctx.fillText((base + Math.sin(time * 0.6 + i + seed) * 1.5).toFixed(1), 150, y + 1);
                ctx.fillStyle = '#26323d';
                ctx.fillRect(200, y - 3, 100, 8);
                ctx.fillStyle = warn ? '#d9534f' : GREEN;
                ctx.fillRect(200, y - 3, 30 + 50 * (0.5 + 0.5 * Math.sin(time * 0.5 + i * 1.3)), 8);
              });
            }
          };
          const screens = [];
          const makeScreen = (kind, seed) => {
            const canvas = canvasOf(SCREEN_W, SCREEN_H);
            const ctx = canvas.getContext('2d');
            const texture = new THREE.CanvasTexture(canvas);
            texture.anisotropy = 4;
            const screen = { ctx, texture, paint: screenPainters[kind], seed };
            screen.paint(ctx, 0, seed);
            texture.needsUpdate = true;
            screens.push(screen);
            return screen;
          };
