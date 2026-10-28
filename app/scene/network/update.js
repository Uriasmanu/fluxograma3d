        const updateNetwork = (time) => {
          const dt = Math.min(time - net.last, 0.1);
          net.last = time;

          if (time >= net.nextTick) {
            net.nextTick = time + 1;
            net.history.recv.push(net.recvBucket);
            net.history.saved.push(net.savedBucket);
            net.recvBucket = 0;
            net.savedBucket = 0;
            if (net.history.recv.length > 60) net.history.recv.shift();
            if (net.history.saved.length > 60) net.history.saved.shift();
          }
          if (time >= net.nextDraw) {
            net.nextDraw = time + (failureSim.active ? 0.2 : 0.5);
            drawDashboard();
          }
          if (time >= net.nextDbSwitch) {
            net.nextDbSwitch = time + 14;
            net.activeDb = 1 - net.activeDb;
            applyMode();
          }

          const panelY = treetechRoof.panelY();
          if (Math.abs(panelY - dashboardPoint.y) > 0.005) {
            dashboardPoint.y = panelY;
            arcSigma.forEach(arc => arc.rebuild());
          }

          if (follow.mode) {
            if (!follow.hero && time >= follow.nextHero) launchHero();
          } else {
            if (net.mode === 'sync') {
              moduleKeys.forEach((key, i) => {
                if (time < net.nextSend[i]) return;
                net.nextSend[i] = time + 3 + Math.random() * 4;
                sendSync(key);
              });
            } else if (time >= net.nextPoll) {
              net.nextPoll = time + 1.4;
              pollE3(moduleKeys[net.pollIndex % moduleKeys.length]);
              net.pollIndex += 1;
            }

            if (time >= net.nextConsume) {
              if (net.depth > 0) {
                consumeQueue();
                net.nextConsume = time + 0.9;
              } else {
                net.nextConsume = time + 0.4;
              }
            }

            netCables.forEach((cable, i) => {
              if (time < net.nextUser[i]) return;
              net.nextUser[i] = time + 6 + Math.random() * 5;
              userSession(cable);
            });
          }

          for (let i = journeys.length - 1; i >= 0; i--) {
            const journey = journeys[i];
            const step = journey.steps[journey.index];
            journey.dist += step.dir * (step.speed || 14) * dt;
            const finished = step.dir > 0 ? journey.dist >= step.path.length : journey.dist <= 0;
            if (finished) {
              if (step.done) step.done(time);
              journey.index += 1;
              if (journey.index >= journey.steps.length) {
                scene.remove(journey.mesh);
                journeys.splice(i, 1);
                if (journey.hero) endHero(time);
                continue;
              }
              enterStep(journey);
            }
            const active = journey.steps[journey.index];
            journey.mesh.position.copy(cablePoint(active.path, journey.dist));
            journey.mesh.position.y += active.path.line ? 0 : 0.12;
            if (journey.hero) setFlowStage(active.stage);
          }

          queueBoxes.forEach((box, i) => { box.visible = i < net.depth; });
          net.flash = Math.max(0, net.flash - dt);
          if (treetechLed.mesh) treetechLed.mesh.material.color.set(net.flash > 0 ? '#ffffff' : '#6fbf8a');
          moduleKeys.forEach(key => {
            const node = moduleNodes[key];
            node.flash = Math.max(0, node.flash - dt);
            node.led.material.color.set(node.flash > 0 ? '#ffffff' : '#6fbf8a');
          });
          updateFollow(dt);
        };
