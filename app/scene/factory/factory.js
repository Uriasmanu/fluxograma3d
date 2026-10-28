        // Fábrica de módulos da Treetech: galpão com linha de produção, funcionários e caixas de módulos
        const factoryRoof = { open: false, amount: 0, walls: null, roof: null, hit: null };
        roofToggles.push(factoryRoof);
        const factoryWorld = new THREE.Group();
        factoryWorld.position.set(54, 0.3, 33);
        scene.add(factoryWorld);
        const factoryBelt = [];
        const factoryWorkers = [];
        const factoryWalker = { group: null, path: null };
        const prototyper = { update: null };

        const buildFactory = () => {
          /* @include app/scene/factory/factory/shell.js */

          /* @include app/scene/factory/factory/production-line.js */


          /* @include app/scene/factory/factory/prototype-wing.js */

          /* @include app/scene/factory/factory/electronics-room.js */

          /* @include app/scene/factory/factory/testing-room.js */

          /* @include app/scene/factory/factory/design-room.js */
        };
        buildFactory();
