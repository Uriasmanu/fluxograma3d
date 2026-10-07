import type { Viewpoint } from '../data/types';

interface TourControlsProps {
  viewpoints: readonly Viewpoint[];
  activeId: string | null;
  onSelect: (viewpoint: Viewpoint) => void;
}

export function TourControls({ viewpoints, activeId, onSelect }: TourControlsProps) {
  return (
    <nav className="tour" aria-label="Pontos de vista">
      <div className="tour-buttons">
        {viewpoints.map((viewpoint) => (
          <button
            key={viewpoint.id}
            type="button"
            className={viewpoint.id === activeId ? 'active' : undefined}
            onClick={() => onSelect(viewpoint)}
          >
            {viewpoint.label}
          </button>
        ))}
      </div>
      <p className="tour-hint">Toque no prédio para abrir o telhado</p>
    </nav>
  );
}
