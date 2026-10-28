        // 13. FÁBRICA, ESTRADA COM VANS, MÓDULOS, ANTENAS E BANCOS DE DADOS
        const BRAND_GREEN = '#2f9e5e';

        // Rótulos: os dos módulos ficam sempre visíveis; os demais aparecem no tour
        const labelSprites = {};
        const ALWAYS_LABELS = ['tm', 'bm', 'gmp', 'dm1', 'dm2'];
        const addLabel = (key, text, x, y, z, width = 4.4) => {
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 128;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = 'rgba(15, 23, 32, 0.9)';
          ctx.fillRect(0, 0, 512, 128);
          ctx.fillStyle = BRAND_GREEN;
          ctx.fillRect(0, 0, 14, 128);
          ctx.fillStyle = '#eef2f5';
          ctx.textBaseline = 'middle';
          let size = 50;
          ctx.font = `bold ${size}px Arial, sans-serif`;
          while (ctx.measureText(text).width > 456 && size > 20) {
            size -= 2;
            ctx.font = `bold ${size}px Arial, sans-serif`;
          }
          ctx.fillText(text, 32, 66);

          const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthTest: false, transparent: true })
          );
          sprite.scale.set(width, width / 4, 1);
          sprite.position.set(x, y, z);
          sprite.renderOrder = 10;
          scene.add(sprite);
          labelSprites[key] = sprite;
        };
        const setLabels = (keys) => {
          const visible = new Set(keys || ALWAYS_LABELS);
          Object.keys(labelSprites).forEach(key => {
            labelSprites[key].visible = visible.has(key);
          });
        };

        const addSlab = (parent, w, h, d, material, x, y, z, shadows = true) => {
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
          mesh.position.set(x, y, z);
          mesh.receiveShadow = true;
          mesh.castShadow = shadows;
          parent.add(mesh);
          return mesh;
        };

        // Terreno de ligação e estrada: principal ao longo da Treetech e ramal até o portão sul da subestação
        const asphaltMat = new THREE.MeshStandardMaterial({ color: '#4a5568', roughness: 0.85 });
        const roadLineMat = new THREE.MeshStandardMaterial({ color: '#d8d2b4', roughness: 0.6 });
        addSlab(scene, 70, 0.06, 3.2, asphaltMat, 30, 0.03, 19.5, false);
        addSlab(scene, 3.2, 0.06, 11.7, asphaltMat, -4, 0.03, 13.65, false);
        addSlab(scene, 4.4, 0.06, 3.7, asphaltMat, 54, 0.03, 22.9, false);
        for (let x = -3; x <= 63; x += 3) addSlab(scene, 1.4, 0.07, 0.12, roadLineMat, x, 0.035, 19.5, false);
        for (let z = 9.5; z <= 17.5; z += 3) addSlab(scene, 0.12, 0.07, 1.4, roadLineMat, -4, 0.035, z, false);

        [2, 14, 26, 38, 49, 60].forEach(lx => {
          const lamp = new THREE.Group();
          lamp.position.set(lx, 0, 21.9);
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 4.2, 8), streetPoleMat);
          post.position.y = 2.1;
          post.castShadow = true;
          lamp.add(post);
          const arm = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 1.0), streetPoleMat);
          arm.position.set(0, 4.15, -0.5);
          lamp.add(arm);
          const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.5), streetLampMat);
          head.position.set(0, 4.08, -1.0);
          lamp.add(head);
          duskLamps.push({ pos: new THREE.Vector3(lx, 4.08, 20.9), city: false });
          scene.add(lamp);
        });

        // Módulos da Treetech instalados nos equipamentos da subestação
        const moduleBodyMat = new THREE.MeshStandardMaterial({ color: '#e8ecef', roughness: 0.5 });
        const moduleStripeMat = new THREE.MeshStandardMaterial({ color: BRAND_GREEN, roughness: 0.5 });
        const moduleNodes = {};

        const createModuleGroup = (scale) => {
          const group = new THREE.Group();
          addSlab(group, 0.34, 0.26, 0.2, moduleBodyMat, 0, 0, 0);
          addSlab(group, 0.34, 0.05, 0.21, moduleStripeMat, 0, 0.105, 0, false);
          const led = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: '#6fbf8a' }));
          led.position.set(0.1, -0.02, 0.105);
          group.add(led);
          group.scale.setScalar(scale);
          return { group, led };
        };

        const placeModule = (key, label, x, y, z, rotY, scale) => {
          const { group, led } = createModuleGroup(scale);
          group.position.set(x, y, z);
          group.rotation.y = rotY;
          scene.add(group);
          moduleNodes[key] = { group, led, flash: 0, top: new THREE.Vector3(x, y + 0.2 * scale, z) };
          addLabel(key, label, x, y + 0.6 + 0.1 * scale, z, 1.15);
        };

        placeModule('tm', 'TM', 1.76, 1.9, 0.35, Math.PI / 2, 1.6);
        placeModule('bm', 'BM', 1.2, 2.71, 0.95, 0, 1.6);
        placeModule('gmp', 'GMP', 2.5, 0.64, -1.3, Math.PI / 2, 2.2);
        placeModule('dm1', 'DM 1', -3.34, 0.95, -1.0, Math.PI / 2, 1.6);
        placeModule('dm2', 'DM 2', 5.06, 0.95, 1.5, Math.PI / 2, 1.6);

        const gmpPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8), matSteel);
        gmpPipe.rotation.z = Math.PI / 2;
        gmpPipe.position.set(1.95, 0.75, -1.3);
        scene.add(gmpPipe);
