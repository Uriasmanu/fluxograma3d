      // Tour guiado: move a câmera, escolhe o modo de comunicação, abre os telhados e mostra os rótulos do passo
      const goToTourStep = (index) => {
        const step = TOUR_STEPS[index];
        if (!step || !controlsRef.current) return;
        const controls = controlsRef.current;
        controls.object.position.set(...step.camera.position);
        controls.target.set(...step.camera.target);
        sceneApiRef.current.setMode(step.mode);
        sceneApiRef.current.setRoofs(step.roofs);
        sceneApiRef.current.setLabels(step.labels);
        sceneApiRef.current.setFollow(step.follow || null);
        setTourStep(index);
      };

      const endTour = () => {
        setTourStep(null);
        sceneApiRef.current.setFollow(null);
        sceneApiRef.current.setMode('sync');
        sceneApiRef.current.setLabels(null);
      };
