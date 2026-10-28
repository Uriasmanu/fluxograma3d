      // Atualizar o modo de renderização (Normal e Fim de Tarde)
      useEffect(() => {
        if (!sceneRef.current) return;
        const scene = sceneRef.current;

        viewModeRef.current = viewMode;
        if (viewMode !== 'dusk') scene.background = new THREE.Color('#dbeafe');
        sceneApiRef.current.setDusk(viewMode === 'dusk');
      }, [viewMode]);
