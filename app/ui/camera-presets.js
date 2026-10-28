      // Alternar Ângulos de Câmera
      const setCameraPreset = (preset) => {
        if (!controlsRef.current) return;
        const controls = controlsRef.current;
        sceneApiRef.current.setFollow(null);

        switch (preset) {
          case 'overview':
            controls.object.position.set(109, 75, 84);
            controls.target.set(29, 0, 4);
            break;
          case 'plant':
            controls.object.position.set(40, 22, 28);
            controls.target.set(16.4, 3, 0);
            break;
          case 'interior':
            plantRoofApiRef.current.setOpen(true);
            controls.object.position.set(25, 12, -12.8);
            controls.target.set(19, 0.8, -1.8);
            break;
          case 'network':
            controls.object.position.set(60, 24, 26);
            controls.target.set(38, 0.5, 3);
            break;
          case 'factory':
            sceneApiRef.current.setRoofs({ factory: true });
            controls.object.position.set(68, 16, 47);
            controls.target.set(54, 1, 33);
            break;
          case 'dashboard':
            treetechRoofApiRef.current.setOpen(true);
            controls.object.position.set(52, 17, 17.5);
            controls.target.set(52, 14.4, 5.7);
            break;
          case 'treetech':
            treetechRoofApiRef.current.setOpen(true);
            controls.object.position.set(74, 22, 32);
            controls.target.set(54, 8, 8);
            break;
          case 'devs':
            treetechRoofApiRef.current.setOpen(true);
            controls.object.position.set(54.6, 13.2, 21);
            controls.target.set(54.6, 7.8, 6.2);
            break;
          case 'city':
            controls.object.position.set(80, 32, 14);
            controls.target.set(54, 2, -18.5);
            break;
          case 'iso':
            controls.object.position.set(22, 18, 22);
            controls.target.set(0, 2.5, 0);
            break;
          case 'top':
            controls.object.position.set(0, 30, 0.1);
            controls.target.set(0, 0, 0);
            break;
          case 'trafo':
            controls.object.position.set(5, 4, 6);
            controls.target.set(0, 2, 0);
            setSelectedComponent('transformer');
            break;
          case 'gantry':
            controls.object.position.set(0, 8, -12);
            controls.target.set(0, 5, -4.5);
            setSelectedComponent('gantry');
            break;
          default:
            break;
        }
      };
