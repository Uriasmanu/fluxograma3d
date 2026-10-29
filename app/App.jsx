    // --- Componente Principal da Subestação ---
    function SubstationApp() {
      const [selectedComponent, setSelectedComponent] = useState(null);
      const [viewMode, setViewMode] = useState('normal'); // 'normal', 'dusk'
      const [breakerClosed, setBreakerClosed] = useState(true);
      const [loadLevel] = useState(78); // %
      const [alarms, setAlarms] = useState([]);
      const [failure, setFailure] = useState({ phase: 'idle', remaining: 20, alerts: [] });
      const failureUiRef = useRef(null);
      const prevViewMode = useRef(null);
      failureUiRef.current = (next) => {
        setFailure(next);
        if (next.phase === 'idle' && prevViewMode.current) {
          setViewMode(prevViewMode.current);
          prevViewMode.current = null;
        }
      };
      const [tourStep, setTourStep] = useState(null);
      const [flow, setFlow] = useState(null);
      const flowUiRef = useRef(null);
      flowUiRef.current = setFlow;
      const [tourPlaying, setTourPlaying] = useState(false);
      const heroDoneRef = useRef(null);

      const sceneRef = useRef(null);
      const controlsRef = useRef(null);
      const componentMeshesRef = useRef({});
      const particleSystemsRef = useRef([]);
      const breakerClosedRef = useRef(true);
      breakerClosedRef.current = breakerClosed;
      const loadLevelRef = useRef(78);
      loadLevelRef.current = loadLevel;
      const plantRoofApiRef = useRef({ setOpen: () => {} });
      const treetechRoofApiRef = useRef({ setOpen: () => {} });
      const sceneApiRef = useRef({ setMode: () => {}, setRoofs: () => {}, setLabels: () => {}, setDusk: () => {}, setFollow: () => {} });
      const viewModeRef = useRef('normal');

      /* @include app/ui/component-data.js */

      /* @include app/scene/scene-effect.js */

      /* @include app/ui/view-mode-effect.js */

      /* @include app/ui/camera-presets.js */

      /* @include app/ui/tour-controls.js */

      /* @include app/ui/breaker.js */

      return (
        <div className="relative w-full h-screen pointer-events-none select-none text-slate-100 flex flex-col justify-between p-4">

          /* @include app/ui/panels/quick-controls.jsx */

          /* @include app/ui/panels/failure-alert.jsx */

          /* @include app/ui/panels/side-panels.jsx */


          /* @include app/ui/panels/flow-hud.jsx */

          /* @include app/ui/panels/tour-panel.jsx */

        </div>
      );
    }
