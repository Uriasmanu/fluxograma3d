          {/* ETAPAS DO PACOTE (E3 E SYNC) */}
          {tourStep !== null && flow && (
            <div className="pointer-events-none fixed left-1/2 -translate-x-1/2 top-4 z-20 w-[56rem] max-w-[94vw] bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl px-4 py-3 shadow-2xl">
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {FLOW_STAGES[flow.mode].map((label, i) => {
                  const accent = flow.mode === 'e3' ? 'bg-sky-500 text-slate-950' : 'bg-orange-500 text-slate-950';
                  const state = i === flow.stage ? accent : i < flow.stage ? 'bg-emerald-700/60 text-emerald-100' : 'bg-slate-800 text-slate-400';
                  return (
                    <React.Fragment key={label + i}>
                      {i > 0 && <span className="text-slate-600 text-xs">›</span>}
                      <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${state}`}>{i + 1}. {label}</span>
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="text-center text-sm text-white mt-2">{FLOW_CAPTIONS[flow.mode][Math.max(0, flow.stage)]}</div>
            </div>
          )}
