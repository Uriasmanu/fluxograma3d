        // CENÁRIO DE FALHA: alarmes, fumaça, explosão do transformador, destruição da usina, apagão e restauração gradual
        const failureCtl = (() => {
          /* @include app/scene/failure/header.js */

          /* @include app/scene/failure/particles.js */

          /* @include app/scene/failure/flames.js */

          /* @include app/scene/failure/sirens.js */

          /* @include app/scene/failure/arcs.js */

          /* @include app/scene/failure/explosion.js */

          /* @include app/scene/failure/ruins.js */

          /* @include app/scene/failure/traffic.js */

          /* @include app/scene/failure/detour-and-explosion.js */

          /* @include app/scene/failure/controller.js */
        })();

        sceneApiRef.current.startFailure = failureCtl.start;
        sceneApiRef.current.resetFailure = failureCtl.restore;
        sceneApiRef.current.abortFailure = failureCtl.abort;
