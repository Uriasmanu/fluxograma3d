import { useEffect } from 'react';
import { YARD } from '../data/yard';
import { AdminBuilding } from './building/AdminBuilding';
import { Conductor } from './conductors/Conductor';
import { buildYardScene } from './conductors/build';
import { Fence } from './environment/Fence';
import { Ground } from './environment/Ground';
import { Lighting } from './environment/Lighting';
import { Trees } from './environment/Trees';
import { resolveEquipmentComponent } from './equipment/registry';
import { Worker } from './people/Worker';

const YARD_SCENE = buildYardScene(YARD);

interface SceneProps {
  roofOpen: boolean;
  onToggleRoof: () => void;
}

export function Scene({ roofOpen, onToggleRoof }: SceneProps) {
  useEffect(() => {
    for (const error of YARD_SCENE.errors) console.error(error);
  }, []);

  return (
    <>
      <Lighting />
      <Ground />
      <Fence />
      <Trees />
      {YARD_SCENE.equipment.map((item) => {
        const Component = resolveEquipmentComponent(item.type);
        return <Component key={item.id} position={item.position} rotationY={item.rotationY} />;
      })}
      {YARD_SCENE.conductors.map(({ key, from, to, sag }) => (
        <Conductor key={key} from={from} to={to} sag={sag} />
      ))}
      <AdminBuilding
        position={YARD.building.position}
        rotationY={YARD.building.rotationY}
        operators={YARD.building.operators}
        roofOpen={roofOpen}
        onToggleRoof={onToggleRoof}
      />
      {YARD_SCENE.workers.map((worker, index) => (
        <Worker
          key={worker.id}
          kind={worker.role}
          position={worker.position}
          facing={worker.facing}
          route={worker.route}
          vestColor={worker.vestColor}
          phase={index * 1.7}
        />
      ))}
    </>
  );
}
