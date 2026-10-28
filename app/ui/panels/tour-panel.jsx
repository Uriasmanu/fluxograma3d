          {/* PAINEL DO TOUR GUIADO */}
          {tourStep !== null && (
            <div className="pointer-events-auto fixed left-1/2 -translate-x-1/2 bottom-24 w-[34rem] max-w-[92vw] bg-slate-900/95 backdrop-blur-md border border-emerald-500/50 rounded-xl p-4 shadow-2xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Tour: como funciona · passo {tourStep + 1} de {TOUR_STEPS.length}
                </span>
                <button onClick={endTour} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
              </div>
              <h3 className="font-bold text-base text-white mb-1">{TOUR_STEPS[tourStep].title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">{TOUR_STEPS[tourStep].text}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {TOUR_STEPS.map((_, i) => (
                    <span key={i} className={`w-2 h-2 rounded-full ${i === tourStep ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={tourStep === 0}
                    onClick={() => goToTourStep(tourStep - 1)}
                    className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs text-slate-200 disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  {tourStep < TOUR_STEPS.length - 1 ? (
                    <button
                      onClick={() => goToTourStep(tourStep + 1)}
                      className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white"
                    >
                      Próximo
                    </button>
                  ) : (
                    <button onClick={endTour} className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white">
                      Concluir
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
