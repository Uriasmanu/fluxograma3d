        // Dashboard do painel de telas: uma imagem de 1920 x 600 dividida em 4 x 2 telas por molduras escuras
        const drawDashboard = () => {
          const { ctx, texture, width: W, height: H } = treetechDashboard;
          if (!ctx) return;
          if (failureSim.active) {
            if (failureSim.exploded) failureSim.paintAlert(ctx, W, H, net.last);
            else failureSim.paintDashboard(ctx, W, H, net.last);
            texture.needsUpdate = true;
            return;
          }
          const tileW = W / 4;
          const tileH = H / 2;
          const orange = '#d9783a';
          const blue = '#6ea8c0';
          const green = '#6fbf8a';
          const grey = '#8aa0b2';
          const white = '#eef2f5';
          const sync = net.mode === 'sync';

          ctx.fillStyle = '#0f1720';
          ctx.fillRect(0, 0, W, H);
          ctx.textBaseline = 'top';
          ctx.textAlign = 'left';

          const title = (text, col, row) => {
            ctx.fillStyle = grey;
            ctx.font = 'bold 24px Arial, sans-serif';
            ctx.fillText(text.toUpperCase(), col * tileW + 28, row * tileH + 22);
          };
          const avg = (list, n) => {
            const last = list.slice(-n);
            return last.length ? last.reduce((sum, v) => sum + v, 0) / last.length : 0;
          };

          title('Sigma ECM  |  Comunicação', 0, 0);
          ctx.fillStyle = sync ? orange : blue;
          ctx.font = 'bold 120px Arial, sans-serif';
          ctx.fillText(sync ? 'Sync' : 'E3', 28, 70);
          ctx.fillStyle = grey;
          ctx.font = '30px Arial, sans-serif';
          ctx.fillText(sync ? 'módulo envia (RabbitMQ)' : 'Sigma consulta (TCP/IP)', 28, 215);
          ctx.fillText(`${avg(net.history.recv, 5).toFixed(1)} leituras / s`, 28, 255);

          title('Fila RabbitMQ', 1, 0);
          ctx.fillStyle = white;
          ctx.font = 'bold 120px Arial, sans-serif';
          ctx.fillText(String(net.depth), tileW + 28, 70);
          ctx.fillStyle = grey;
          ctx.font = '32px Arial, sans-serif';
          ctx.fillText('mensagens na fila', tileW + 28, 205);
          ctx.fillStyle = '#1f2b36';
          ctx.fillRect(tileW + 28, 255, tileW - 56, 16);
          ctx.fillStyle = orange;
          ctx.fillRect(tileW + 28, 255, ((tileW - 56) * Math.min(net.depth, MAX_QUEUE_BOXES)) / MAX_QUEUE_BOXES, 16);

          title('Módulos', 2, 0);
          const closed = breakerClosedRef.current;
          const load = loadLevelRef.current;
          [
            ['TM', `óleo ${Math.round(55 + load * 0.25)} °C`],
            ['BM', 'buchas normais'],
            ['GMP', `umidade ${Math.round(6 + load / 20)} ppm`],
            ['DM', closed ? 'contatos fechados' : 'contatos abertos']
          ].forEach(([name, value], i) => {
            const y = 74 + i * 54;
            ctx.fillStyle = green;
            ctx.beginPath();
            ctx.arc(2 * tileW + 40, y + 16, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = white;
            ctx.font = 'bold 30px Arial, sans-serif';
            ctx.fillText(name, 2 * tileW + 64, y);
            ctx.fillStyle = grey;
            ctx.font = '28px Arial, sans-serif';
            ctx.fillText(value, 2 * tileW + 150, y + 2);
          });

          title('Subestação', 3, 0);
          ctx.fillStyle = closed ? green : '#c26a62';
          ctx.font = 'bold 42px Arial, sans-serif';
          ctx.fillText(closed ? 'Disjuntor fechado' : 'Disjuntor aberto', 3 * tileW + 28, 76);
          ctx.fillStyle = white;
          ctx.font = 'bold 92px Arial, sans-serif';
          ctx.fillText(`${closed ? Math.round(48 * load / 100) : 0} MW`, 3 * tileW + 28, 130);
          ctx.fillStyle = grey;
          ctx.font = '30px Arial, sans-serif';
          ctx.fillText(`carga ${load}%`, 3 * tileW + 28, 245);

          title('Leituras por segundo (60 s)', 0, 1);
          const chartLeft = 28;
          const chartRight = 2 * tileW - 28;
          const chartTop = tileH + 80;
          const chartBottom = H - 34;
          const maxValue = Math.max(3, ...net.history.recv, ...net.history.saved);
          ctx.strokeStyle = '#26333f';
          ctx.lineWidth = 2;
          for (let g = 0; g <= 3; g++) {
            const gy = chartTop + ((chartBottom - chartTop) * g) / 3;
            ctx.beginPath();
            ctx.moveTo(chartLeft, gy);
            ctx.lineTo(chartRight, gy);
            ctx.stroke();
          }
          const plot = (series, color) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 5;
            ctx.beginPath();
            const offset = 60 - series.length;
            series.forEach((value, i) => {
              const x = chartLeft + ((chartRight - chartLeft) * (i + offset)) / 59;
              const y = chartBottom - ((chartBottom - chartTop) * value) / maxValue;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            });
            ctx.stroke();
          };
          plot(net.history.recv, sync ? orange : blue);
          plot(net.history.saved, green);

          title('Banco de dados', 2, 1);
          ctx.fillStyle = white;
          ctx.font = 'bold 44px Arial, sans-serif';
          ctx.fillText(DB_NAMES[net.activeDb], 2 * tileW + 28, tileH + 62);
          [['recebidas', net.received], ['gravadas', net.saved], ['exibidas', net.shown]].forEach(([label, value], i) => {
            ctx.fillStyle = grey;
            ctx.font = '28px Arial, sans-serif';
            ctx.fillText(label, 2 * tileW + 28, tileH + 128 + i * 46);
            ctx.fillStyle = white;
            ctx.font = 'bold 34px Arial, sans-serif';
            ctx.fillText(String(value), 2 * tileW + 230, tileH + 124 + i * 46);
          });

          title('Eventos', 3, 1);
          ctx.fillStyle = white;
          ctx.font = '23px Arial, sans-serif';
          net.events.forEach((event, i) => ctx.fillText(event, 3 * tileW + 28, tileH + 66 + i * 36));

          ctx.strokeStyle = '#05080b';
          ctx.lineWidth = 10;
          for (let i = 1; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(i * tileW, 0);
            ctx.lineTo(i * tileW, H);
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.moveTo(0, tileH);
          ctx.lineTo(W, tileH);
          ctx.stroke();
          ctx.strokeRect(5, 5, W - 10, H - 10);

          texture.needsUpdate = true;
        };

        applyMode();
        drawDashboard();
