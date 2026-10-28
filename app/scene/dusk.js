        // Fim de tarde: sol baixo e alaranjado, céu em degradê, postes, janelas e faróis acesos
        const skyCanvas = document.createElement('canvas');
        skyCanvas.width = 4;
        skyCanvas.height = 512;
        const skyCtx = skyCanvas.getContext('2d');
        const skyGrad = skyCtx.createLinearGradient(0, 0, 0, 512);
        skyGrad.addColorStop(0, '#2c3a66');
        skyGrad.addColorStop(0.45, '#8a5f86');
        skyGrad.addColorStop(0.75, '#e28a6a');
        skyGrad.addColorStop(1, '#f6c183');
        skyCtx.fillStyle = skyGrad;
        skyCtx.fillRect(0, 0, 4, 512);
        const duskSky = new THREE.CanvasTexture(skyCanvas);
        const daySky = new THREE.Color('#dbeafe');

        const poolGeo = new THREE.PlaneGeometry(9, 9);
        const lampLights = [];
        duskLamps.forEach((lamp, i) => {
          const city = lamp.city;
          const pool = new THREE.Mesh(poolGeo, new THREE.MeshBasicMaterial({
            map: glowTexture, color: 0xffd9a0, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0
          }));
          pool.material.userData.preserve = true;
          pool.rotation.x = -Math.PI / 2;
          pool.position.set(lamp.pos.x, city ? 0.38 : 0.1, lamp.pos.z);
          pool.visible = false;
          scene.add(pool);
          duskGlows.push({ obj: pool, max: city ? 0.5 : 0.9, city });
          const halo = addGlow(scene, lamp.pos.x, lamp.pos.y, lamp.pos.z, 2.6, 0.95);
          halo.city = city;
          if (i % 2 === 0) {
            const light = new THREE.PointLight(0xffd9a0, 0, 14, 2);
            light.position.set(lamp.pos.x, 3.6, lamp.pos.z);
            scene.add(light);
            lampLights.push({ light, city });
          }
        });

        const duskState = { target: 0, level: 0 };
        const dayAmbient = new THREE.Color(0xffffff);
        const duskAmbient = new THREE.Color(0x9a86b4);
        const daySun = new THREE.Color(0xffffff);
        const duskSun = new THREE.Color(0xff9d57);
        const dayOffset = new THREE.Vector3(25, 35, 15);
        const duskOffset = new THREE.Vector3(-48, 20, 38);
        const dayTarget = new THREE.Vector3(0, 0, 0);
        const duskTarget = new THREE.Vector3(30, 0, 10);
        scene.add(sunLight.target);

        const updateDusk = () => {
          const before = duskState.level;
          duskState.level += Math.max(-0.04, Math.min(0.04, duskState.target - duskState.level));
          const d = duskState.level;
          if (d === before && duskState.applied === d) return;
          duskState.applied = d;

          ambientLight.color.lerpColors(dayAmbient, duskAmbient, d);
          ambientLight.intensity = 0.65 - 0.25 * d;
          sunLight.color.lerpColors(daySun, duskSun, d);
          sunLight.intensity = 1.2 - 0.15 * d;
          sunLight.target.position.lerpVectors(dayTarget, duskTarget, d);
          sunLight.position.lerpVectors(dayOffset, duskOffset, d).add(sunLight.target.position);
          renderer.toneMappingExposure = 1.1 - 0.1 * d;
          nightSpotlights.forEach(spot => { spot.intensity = 1.8 * d; });

          duskWindowMats.forEach(mat => {
            mat.emissive.set('#f3d98a');
            mat.emissiveIntensity = 0.9 * d;
          });
          duskLightMats.forEach(({ mat, day, dusk }) => { mat.emissiveIntensity = day + (dusk - day) * d; });
          if (viewModeRef.current === 'dusk') scene.background = d > 0.5 ? duskSky : daySky;
        };

        const applyDuskLamps = () => {
          const litAt = (o) => breakerClosedRef.current && failureSim.lit(o.position.x, o.position.z);
          const d = duskState.level;
          duskGlows.forEach(glow => {
            const on = d > 0.01 && (!glow.city || litAt(glow.obj));
            glow.obj.visible = on;
            if (on) {
              glow.obj.material.transparent = true;
              glow.obj.material.opacity = glow.max * d;
            }
          });
          lampLights.forEach(({ light, city }) => { light.intensity = (!city || litAt(light)) ? 1.6 * d : 0; });
          duskInteriorLights.forEach(({ light, max }) => { light.intensity = max * d; });
        };
