        const buildOfficeLife = (floors) => {
          let furniture = floors.ground;
          const { GREEN, V, stdMat, box, addMesh, ss, win, lerpAngle, canvasOf, screens, makeScreen, createPerson, makeState } = lifeKit;
          const aabb = (name, cx, cy, cz, sx, sy, sz) => officeLife.obstacles.push({ name, min: [cx - sx / 2, cy - sy / 2, cz - sz / 2], max: [cx + sx / 2, cy + sy / 2, cz + sz / 2] });

          /* @include app/scene/office/office-life/dev-desks.js */

          /* @include app/scene/office/office-life/coffee-corner.js */

          /* @include app/scene/office/office-life/coffee-stations.js */

          /* @include app/scene/office/office-life/assembly.js */
        };
