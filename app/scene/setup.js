        const container = document.getElementById('canvas-container');
        if (!container) return;

        // Cena, Câmera e Renderizador
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color('#dbeafe');

        const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);

        // Vista Isométrica inicial idêntica à foto
        camera.position.set(109, 75, 84);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;

        container.appendChild(renderer.domElement);

        // Controles de Câmera Órbita
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxPolarAngle = Math.PI / 2 - 0.02; // Não atravessar o chão
        controls.minDistance = 5;
        controls.maxDistance = 220;
        controls.target.set(29, 0, 4);
        controlsRef.current = controls;

        // Iluminação Ambientes e Sol
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        sunLight.position.set(25, 35, 15);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 4096;
        sunLight.shadow.mapSize.height = 4096;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 220;
        const d = 80;
        sunLight.shadow.camera.left = -d;
        sunLight.shadow.camera.right = d;
        sunLight.shadow.camera.top = d;
        sunLight.shadow.camera.bottom = -d;
        scene.add(sunLight);

        // Luzes de segurança nos cantos da cerca, acesas só no Fim de Tarde
        const nightSpotlights = [];
        const spotPos = [[-7.5, 7.5], [7.5, 7.5], [-7.5, -7.5], [7.5, -7.5]];
        spotPos.forEach(([x, z]) => {
          const spot = new THREE.SpotLight(0xfffaed, 0, 25, Math.PI / 4, 0.4);
          spot.position.set(x, 4.5, z);
          spot.target.position.set(0, 1, 0);
          scene.add(spot);
          scene.add(spot.target);
          nightSpotlights.push(spot);
        });

        // --- MATERIAIS ---
        const colors = {
          grass: '#82ad50',
          concrete: '#b0b5ba',
          transformerGrey: '#7b8793',
          radiatorGrey: '#5a646e',
          porcelainBrown: '#5c2d18',
          metalSteel: '#8a97a4',
          yellowFence: '#f3b312',
          cabinetWhite: '#e2e8f0',
          warningYellow: '#eab308'
        };

        const matGrass = new THREE.MeshStandardMaterial({ color: colors.grass, roughness: 0.9 });
        const matConcrete = new THREE.MeshStandardMaterial({ color: colors.concrete, roughness: 0.6 });
        const matTrafo = new THREE.MeshStandardMaterial({ color: colors.transformerGrey, roughness: 0.4, metalness: 0.3 });
        const matRadiator = new THREE.MeshStandardMaterial({ color: colors.radiatorGrey, roughness: 0.5, metalness: 0.2 });
        const matPorcelain = new THREE.MeshStandardMaterial({ color: colors.porcelainBrown, roughness: 0.15, metalness: 0.1 });
        const matSteel = new THREE.MeshStandardMaterial({ color: colors.metalSteel, roughness: 0.3, metalness: 0.7 });
        const matFence = new THREE.MeshStandardMaterial({ color: colors.yellowFence, roughness: 0.4, metalness: 0.2 });
        const matCabinet = new THREE.MeshStandardMaterial({ color: colors.cabinetWhite, roughness: 0.3, metalness: 0.1 });

        // Grupo principal da Subestação
        const substationGroup = new THREE.Group();
        scene.add(substationGroup);
