import { MATERIALS } from '../materials';
import { Block } from '../primitives';
import { Chair } from './Chair';
import { Desk } from './Desk';
import { Worker } from '../people/Worker';
import { BUILDING, OPERATOR_SEATS, operatorSeats } from './layout';
import { Monitor } from './Monitor';

const DESK_Z = -1.4;
const DESK_XS = [-2.4, 2.4];
const MURAL_Z = -3.2;

interface MonitoringRoomProps {
  operators: number;
}

export function MonitoringRoom({ operators }: MonitoringRoomProps) {
  return (
    <group position={[0, BUILDING.floorHeight, 0]}>
      <Block size={[6, 1.8, 0.15]} position={[0, 1.9, MURAL_Z]} material={MATERIALS.panel} radius={0.05} />
      <Block size={[0.15, 1, 0.15]} position={[-2.6, 0.5, MURAL_Z]} material={MATERIALS.steel} />
      <Block size={[0.15, 1, 0.15]} position={[2.6, 0.5, MURAL_Z]} material={MATERIALS.steel} />
      {[2.5, 2.1, 1.7].map((y) => (
        <Block key={y} size={[4.6, 0.08, 0.02]} position={[0, y, MURAL_Z + 0.09]} material={MATERIALS.screenOn} />
      ))}
      <Block size={[0.08, 0.8, 0.02]} position={[0, 2.1, MURAL_Z + 0.09]} material={MATERIALS.screenOn} />
      {DESK_XS.map((x) => (
        <Desk key={x} position={[x, 0, DESK_Z]} />
      ))}
      {OPERATOR_SEATS.map(([x]) => (
        <group key={x}>
          <Monitor position={[x, 0.8, DESK_Z - 0.2]} />
          <Chair position={[x, 0, -0.4]} />
        </group>
      ))}
      {operatorSeats(operators).map((seat, index) => (
        <Worker
          key={`operator-${index}`}
          kind="operator"
          position={seat}
          heading={Math.PI}
          vestColor="#3b82f6"
          phase={index * 2.3}
          scale={1}
        />
      ))}
    </group>
  );
}
