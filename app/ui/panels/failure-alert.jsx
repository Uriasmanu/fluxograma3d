          {/* PAINEL DA FALHA: contagem regressiva e alertas girando */}
          {failure.phase === 'countdown' && (
            <div className="pointer-events-none fixed left-1/2 -translate-x-1/2 top-20 w-[30rem] max-w-[92vw] z-30">
              <div className="bg-red-700/95 border-2 border-red-300 rounded-xl px-4 py-3 shadow-2xl shadow-red-900/60 animate-pulse text-center">
                <div className="text-[11px] font-bold tracking-widest text-red-100">FALHA CRÍTICA · TRAFO 01</div>
                <div className="text-4xl font-black font-mono text-white leading-tight">
                  {String(Math.floor(failure.remaining / 60)).padStart(1, '0')}:{String(failure.remaining % 60).padStart(2, '0')}
                </div>
                <div className="text-[11px] text-red-100">tempo até a explosão</div>
              </div>
              <div className="mt-2 flex flex-col gap-1">
                {failure.alerts.map((alert, i) => (
                  <div key={alert} className={`bg-slate-950/90 border border-red-500/70 text-red-200 text-xs rounded-lg px-3 py-1.5 ${i === 0 ? 'font-bold opacity-100' : 'opacity-60'}`}>
                    ⚠ {alert}
                  </div>
                ))}
              </div>
            </div>
          )}
          {failure.phase === 'exploded' && (
            <div className="pointer-events-none fixed left-1/2 -translate-x-1/2 top-20 z-30 bg-slate-950/90 border-2 border-red-500 rounded-xl px-5 py-3 text-center shadow-2xl">
              <div className="text-sm font-black text-red-400 tracking-wider">TRANSFORMADOR DESTRUÍDO</div>
              <div className="text-xs text-slate-300">A usina foi atingida e a cidade está sem energia.</div>
            </div>
          )}
