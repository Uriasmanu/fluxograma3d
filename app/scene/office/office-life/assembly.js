          // ---------- Montagem ----------
          const P1 = { skin: '#f1c7a1', shirt: '#7fa88c', pants: '#2f3b52', hair: '#4a3426', hairStyle: 'short', top: 'tee', sleeves: 'short', mugColor: '#e8ecef' };
          const person = (extra) => Object.assign({}, P1, extra);
          const coffeeCorner = buildCoffeeCorner();
          addDevDesk(0, -3.7, { rabbit: true, coffeeRun: coffeeCorner, phase: 3, glance: 1, seed: 0.1, person: person({ shirt: '#17181b', pants: '#2a2f3a', shoe: '#e8ecef', hair: '#1d1612', hairStyle: 'fade', glasses: 'round', bigEyes: true, stubble: true, logo: true, top: 'tee', sleeves: 'tee', tattoo: 0, skin: '#d6a07a', mugColor: '#1f2429', blinkSeed: 0.4 }) });
          furniture = floors.dev;
          addDevDesk(-3.2, -3.7, { screen: 'config', seed: 0.2, phase: 0, glance: 1, extra: 'laptop', person: person({ shirt: '#8aa4c0', hair: '#1f1a17', hairStyle: 'curly', glasses: true, top: 'shirt', skin: '#9c6b4a', mugColor: '#c0504a', blinkSeed: 1.1 }) });
          addDevDesk(3.2, -3.7, { screen: 'config', seed: 0.6, phase: 7, glance: -1, extra: 'notebook', person: person({ shirt: '#d9783a', hair: '#7a4a2a', hairStyle: 'long', top: 'tee', skin: '#f1c7a1', headphones: true, mugColor: '#2f9e5e', blinkSeed: 2.2 }) });
          addDevDesk(-2.2, -1.0, { screen: 'config', seed: 0.8, phase: 12, glance: 1, extra: 'notebook', person: person({ shirt: '#9db8a4', hair: '#c9a64a', hairStyle: 'bun', top: 'hoodie', sleeves: 'long', skin: '#f6d2b0', glasses: true, mugColor: '#e8c34a', blinkSeed: 0.9 }) });
          addDevDesk(2.2, -1.0, { screen: 'config', seed: 0.3, phase: 18, glance: -1, extra: 'laptop', person: person({ shirt: '#a8bfae', hair: '#1f1a17', hairStyle: 'short', beard: true, top: 'shirt', sleeves: 'long', skin: '#b07850', mugColor: '#5b8fc0', blinkSeed: 3.1 }) });
          furniture = floors.sigma;
          addDevDesk(-9.2, -1.2, { screen: 'ops', seed: 0.5, phase: 5, glance: 1, person: person({ shirt: '#6f9a82', hair: '#2b2118', hairStyle: 'cap', top: 'tee', skin: '#e0ac86', mugColor: '#e8ecef', blinkSeed: 1.7 }) });
          addDevDesk(-6.8, -1.2, { screen: 'ops', seed: 0.9, phase: 14, glance: -1, extra: 'notebook', person: person({ shirt: '#c0a98a', hair: '#8a5a3a', hairStyle: 'long', glasses: true, top: 'tee', skin: '#f1c7a1', mugColor: '#d9783a', blinkSeed: 2.8 }) });

          const coffeePersonA = person({ shirt: '#5b8fc0', hair: '#3a2a1e', hairStyle: 'short', top: 'tee', skin: '#e0ac86', mugColor: '#c0504a', blinkSeed: 0.3 });
          const coffeePersonB = person({ shirt: '#9db8a4', hair: '#c9a64a', hairStyle: 'long', top: 'hoodie', sleeves: 'long', skin: '#f6d2b0', mugColor: '#2f9e5e', blinkSeed: 1.5 });
          const coffeePersonC = person({ shirt: '#d9783a', hair: '#1f1a17', hairStyle: 'curly', top: 'shirt', skin: '#9c6b4a', glasses: true, mugColor: '#e8ecef', blinkSeed: 2.4 });
          const coffeePersonD = person({ shirt: '#8aa89a', hair: '#7a4a2a', hairStyle: 'bun', top: 'tee', skin: '#f1c7a1', headphones: false, mugColor: '#e8c34a', blinkSeed: 3.3 });
          furniture = floors.dev;
          buildCoffee({
            name: 'leste', x: 4.5, z: -1.5, rotY: -Math.PI / 2,
            spots: [
              { lat: -0.36, offset: 0, seed: 0, yawSign: -1, person: coffeePersonA, walk: [[3.92, -1.86], [3.6, -2.0], [1.7, -2.0], [1.7, -2.6]], look: [1.7, -3.5] },
              { lat: 0.36, offset: 20, seed: 2.5, yawSign: 1, person: coffeePersonB, walk: [[3.92, -1.14], [3.75, -0.9], [3.75, 0.62], [1.2, 0.62]], look: [1.4, 1.5] }
            ]
          });
          furniture = floors.sigma;
          buildCoffee({
            name: 'anexo', x: -10.5, z: -2.7, rotY: Math.PI / 2,
            spots: [
              { lat: -0.36, offset: 8, seed: 1, yawSign: -1, person: coffeePersonC, walk: [[-9.92, -2.34], [-9.5, -2.3], [-7.6, -2.3]], look: [-7.6, -3.8] },
              { lat: 0.36, offset: 28, seed: 3.5, yawSign: 1, person: coffeePersonD, walk: [[-9.92, -3.06], [-9.5, -3.1], [-6.2, -3.1]], look: [-6.2, -3.8] }
            ]
          });

          furniture = floors.dev;
          // quadro kanban na parede norte e plantas de canto
          const boardCanvas = canvasOf(512, 256);
          const bctx = boardCanvas.getContext('2d');
          bctx.fillStyle = '#f4f7f5';
          bctx.fillRect(0, 0, 512, 256);
          bctx.fillStyle = GREEN;
          bctx.fillRect(0, 0, 512, 34);
          bctx.fillStyle = '#ffffff';
          bctx.font = 'bold 22px Arial, sans-serif';
          bctx.textBaseline = 'middle';
          bctx.fillText('Sprint 24 · Sigma ECM', 14, 18);
          ['Backlog', 'Em dev', 'Review', 'Pronto'].forEach((title, c) => {
            const x = 10 + c * 125;
            bctx.fillStyle = '#e1e6ea';
            bctx.fillRect(x, 44, 118, 204);
            bctx.fillStyle = '#2b323a';
            bctx.font = 'bold 15px Arial, sans-serif';
            bctx.fillText(title, x + 8, 60);
            const colors = ['#f6e27a', '#9fd8b0', '#f4a6a0', '#a8c8f0'];
            for (let r = 0; r < 4 - (c === 3 ? 0 : c % 2); r++) {
              bctx.fillStyle = colors[(r + c) % 4];
              bctx.fillRect(x + 8, 74 + r * 42, 102, 34);
              bctx.fillStyle = '#4a5560';
              bctx.fillRect(x + 14, 84 + r * 42, 70, 4);
              bctx.fillRect(x + 14, 94 + r * 42, 48, 4);
            }
          });
          const board = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.75), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(boardCanvas) }));
          board.position.set(-1.6, 1.9, -4.235);
          furniture.add(board);
          addMesh(furniture, box(1.56, 0.81, 0.02), stdMat('#7a8088', 0.5), -1.6, 1.9, -4.24, false);

          // tela grande da parede norte: repete a configuração do módulo (script, E3 e Sync)
          const wallScreen = makeScreen('config', 0.35);
          addMesh(furniture, box(2.3, 1.45, 0.06), stdMat('#1a2026', 0.5), 0.8, 1.95, -4.22, false);
          const wallFace = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.375), new THREE.MeshBasicMaterial({ map: wallScreen.texture }));
          wallFace.position.set(0.8, 1.95, -4.185);
          [-0.95, 2.55].forEach(px => addMesh(furniture, box(0.08, 1.2, 0.08), stdMat('#1a2026', 0.5), px, 0.6, -4.21, false));
          furniture.add(wallFace);

          let lastDraw = -1;
          officeLife.update = (time) => {
            if (time - lastDraw > 0.16) {
              lastDraw = time;
              screens.forEach(sc => {
                if (sc.home) {
                  if (homeLife.on[sc.plot] === false) {
                    sc.ctx.fillStyle = '#05080a';
                    sc.ctx.fillRect(0, 0, 320, 200);
                  } else sc.paint(sc.ctx, time, sc.seed);
                } else if (failureSim.active) failureSim.paintAlert(sc.ctx, 320, 200, time);
                else sc.paint(sc.ctx, time, sc.seed);
                sc.texture.needsUpdate = true;
              });
            }
            officeLife.tickers.forEach(tick => tick(time));
          };
