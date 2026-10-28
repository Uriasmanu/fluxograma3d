        // Interface com o React: o tour liga o modo, abre os telhados e escolhe os rótulos
        const roofByName = { plant: plantRoof, treetech: treetechRoof, factory: factoryRoof };
        sceneApiRef.current = {
          setMode: (mode) => {
            if (net.mode !== mode) {
              journeys.forEach(journey => scene.remove(journey.mesh));
              journeys.length = 0;
              follow.hero = null;
              net.depth = 0;
            }
            net.mode = mode;
            applyMode();
          },
          setFollow: (mode) => {
            if (follow.hero) {
              scene.remove(follow.hero.mesh);
              const at = journeys.indexOf(follow.hero);
              if (at >= 0) journeys.splice(at, 1);
              follow.hero = null;
            }
            follow.mode = mode;
            follow.stage = -1;
            if (mode) {
              follow.keyIndex = 0;
              follow.nextHero = net.last + 1.5;
              prepareNextHero();
              setFlowStage(0);
            } else if (flowUiRef.current) {
              flowUiRef.current(null);
            }
          },
          setRoofs: (state) => {
            Object.keys(state).forEach(name => {
              if (roofByName[name]) roofByName[name].open = state[name];
            });
          },
          setLabels,
          setDusk: (on) => { duskState.target = on ? 1 : 0; }
        };
