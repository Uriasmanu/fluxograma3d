        // --- SISTEMA DE SELEÇÃO E RAYCASTING (CLIQUE NOS COMPONENTES) ---
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const handleClick = (event) => {
          if (event.target !== renderer.domElement) return;
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(substationGroup.children, true);

          if (intersects.length > 0) {
            let obj = intersects[0].object;
            while (obj.parent && obj.parent !== substationGroup && !obj.name) {
              obj = obj.parent;
            }
            if (obj.name && componentData[obj.name]) {
              setSelectedComponent(obj.name);
            }
          }
        };

        window.addEventListener('click', handleClick);

        // Clique no escritório da usina abre/fecha o telhado (ignora cliques depois de arrastar a câmera)
        const plantRaycaster = new THREE.Raycaster();
        const plantMouse = new THREE.Vector2();
        let pressX = 0;
        let pressY = 0;
        const handlePressStart = (event) => {
          pressX = event.clientX;
          pressY = event.clientY;
        };
        const handleOfficeClick = (event) => {
          if (event.target !== renderer.domElement) return;
          if (Math.hypot(event.clientX - pressX, event.clientY - pressY) > 5) return;
          plantMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          plantMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
          plantRaycaster.setFromCamera(plantMouse, camera);
          const hit = plantRaycaster.intersectObjects(scene.children, true)[0];
          roofToggles.forEach(toggle => {
            let node = hit ? hit.object : null;
            while (node && node !== toggle.hit) node = node.parent;
            if (node) toggle.open = !toggle.open;
          });
        };
        window.addEventListener('pointerdown', handlePressStart);
        window.addEventListener('click', handleOfficeClick);

        // Redimensionamento de tela
        const handleResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
