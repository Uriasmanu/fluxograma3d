          // Sala 2: câmara de ensaio térmico e bancada com osciloscópio
          addSlab(furniture, 1.8, 1.7, 1.3, mat('#aab4bc', 0.5), -0.8, 0.85, 8.3);
          addSlab(furniture, 1.1, 1.0, 0.04, glassMat, -0.8, 1.0, 7.64, false);
          addSlab(furniture, 0.3, 0.2, 0.04, screenLab, -0.2, 1.5, 7.64, false);
          const { group: chamberModule } = createModuleGroup(1.2);
          chamberModule.position.set(-0.8, 1.88, 8.3);
          furniture.add(chamberModule);
          addBench(1.3, 8.6, 1.5);
          addSlab(furniture, 0.55, 0.4, 0.4, darkLab, 1.3, 1.14, 8.7);
          addSlab(furniture, 0.42, 0.26, 0.04, screenLab, 1.3, 1.16, 8.49, false);
          addEngineer(0.4, 7.2, '#9db8a4');
