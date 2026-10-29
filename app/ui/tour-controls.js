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
        setTourPlaying(false);
        setTourStep(null);
        sceneApiRef.current.setFollow(null);
        sceneApiRef.current.setMode('sync');
        sceneApiRef.current.setLabels(null);
      };

      // Tour em loop: avança sozinho (ou quando o pacote acompanhado termina) e volta ao 1º passo até ser parado
      const advanceTour = () => goToTourStep((tourStep + 1) % TOUR_STEPS.length);
      heroDoneRef.current = () => { if (tourPlaying) advanceTour(); };

      const toggleTour = () => {
        if (tourStep !== null) {
          endTour();
          return;
        }
        setTourPlaying(true);
        goToTourStep(0);
      };

      useEffect(() => {
        if (!tourPlaying || tourStep === null) return undefined;
        const step = TOUR_STEPS[tourStep];
        const wait = step.follow ? 180000 : step.duration || Math.max(8000, step.text.length * 55);
        const timer = setTimeout(advanceTour, wait);
        return () => clearTimeout(timer);
      }, [tourPlaying, tourStep]);
