          {/* CONTROLES RÁPIDOS */}
          <header className="pointer-events-none flex justify-end">
            {/* BARRA DE CONTROLES RÁPIDOS */}
            <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl p-2 shadow-2xl">
              {failure.phase === 'idle' && (
                <button
                  onClick={() => { prevViewMode.current = viewMode === 'dusk' ? null : viewMode; setViewMode('dusk'); setCameraPreset('dashboard'); sceneApiRef.current.startFailure(); }}
                  className="px-3 py-2 rounded-lg font-bold text-xs bg-red-700 hover:bg-red-600 text-white shadow-lg shadow-red-900/50 border border-red-400/60"
                >
                  ⚠ FALHA
                </button>
              )}
              {failure.phase === 'countdown' && (
                <button
                  onClick={() => sceneApiRef.current.abortFailure()}
                  className="px-3 py-2 rounded-lg font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-900 border border-amber-200 shadow-lg shadow-amber-900/40"
                >
                  ■ DESATIVAR FALHA · {failure.remaining}s
                </button>
              )}
              {failure.phase === 'aborting' && (
                <button disabled className="px-3 py-2 rounded-lg font-bold text-xs bg-amber-900 text-amber-200 border border-amber-500 animate-pulse">
                  ■ DESATIVANDO…
                </button>
              )}
              {failure.phase === 'exploded' && (
                <button
                  onClick={() => sceneApiRef.current.resetFailure()}
                  className="px-3 py-2 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-300/60"
                >
                  ↺ RESTAURAR SISTEMA
                </button>
              )}
              {failure.phase === 'restoring' && (
                <button disabled className="px-3 py-2 rounded-lg font-bold text-xs bg-emerald-900 text-emerald-200 border border-emerald-500 animate-pulse">
                  ↺ RESTAURANDO… {failure.remaining}%
                </button>
              )}
              <button
                onClick={toggleBreaker}
                className={`px-3 py-2 rounded-lg font-bold text-xs transition-all shadow-lg flex items-center gap-2 ${
                  breakerClosed
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
                }`}
              >
                <Icons.Zap />
                {breakerClosed ? 'DESENERGIZAR DISJUNTOR' : 'ENERGIZAR SUBESTAÇÃO'}
              </button>
            </div>
          </header>
