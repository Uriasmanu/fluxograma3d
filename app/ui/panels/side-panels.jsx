          {/* PAINEL CENTRAL DE VISUALIZAÇÃO E TELEMETRIA */}
          <div className="flex justify-between items-start gap-4 my-auto">

            {/* PAINEL ESQUERDO: SELEÇÃO DE VISTAS E MODOS */}
            <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl p-3 flex flex-col gap-3 w-48 shadow-xl">
              <button onClick={toggleTour} className={`px-2 py-2 rounded text-xs font-bold text-white ${tourStep !== null ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                {tourStep !== null ? '■ Parar tour' : 'Tour: como funciona'}
              </button>
              <div className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <Icons.Camera /> Câmera Presets
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button onClick={() => setCameraPreset('overview')} className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-200 border border-slate-700">Visão Geral</button>
                <button onClick={() => setCameraPreset('city')} className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-200 border border-slate-700">Cidade</button>
                <button onClick={() => setCameraPreset('plant')} className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-200 border border-slate-700">Usina</button>
                <button onClick={() => setCameraPreset('interior')} className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-200 border border-slate-700">Interior</button>
                <button onClick={() => setCameraPreset('treetech')} className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-200 border border-slate-700">Treetech</button>
                <button onClick={() => setCameraPreset('devs')} className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-200 border border-slate-700">Devs</button>
                <button onClick={() => setCameraPreset('network')} className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-200 border border-slate-700">Rede</button>
                <button onClick={() => setCameraPreset('dashboard')} className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-200 border border-slate-700">Painel</button>
                <button onClick={() => setCameraPreset('factory')} className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-200 border border-slate-700">Fábrica</button>
                <button onClick={() => setCameraPreset('iso')} className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-200 border border-slate-700">Isométrica</button>
                <button onClick={() => setCameraPreset('top')} className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-200 border border-slate-700">Planta Baixa</button>
                <button onClick={() => setCameraPreset('trafo')} className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-200 border border-slate-700">Trafo 01</button>
                <button onClick={() => setCameraPreset('gantry')} className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-200 border border-slate-700">Pórtico AT</button>
              </div>

              <div className="text-xs font-bold text-slate-400 tracking-wider uppercase border-b border-slate-800 pb-1.5 mt-2 flex items-center gap-1.5">
                <Icons.Eye /> Modos de Render
              </div>
              <div className="flex flex-col gap-1.5">
                <button onClick={() => setViewMode('normal')} className={`px-2.5 py-1.5 rounded text-xs text-left border ${viewMode === 'normal' ? 'bg-sky-600/30 border-sky-500 text-sky-200' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>Standard 3D</button>
                <button onClick={() => setViewMode('dusk')} className={`px-2.5 py-1.5 rounded text-xs text-left border ${viewMode === 'dusk' ? 'bg-sky-600/30 border-sky-500 text-sky-200' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>Fim de Tarde</button>
              </div>
            </div>

            {/* CARD DE DETALHES DO COMPONENTE SELECIONADO (DIREITA) */}
            {selectedComponent && componentData[selectedComponent] && (
              <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl p-4 w-80 shadow-2xl animate-fade-in">
                <div className="flex justify-between items-start border-b border-slate-800 pb-2 mb-3">
                  <h3 className="font-bold text-sm text-amber-400">{componentData[selectedComponent].title}</h3>
                  <button onClick={() => setSelectedComponent(null)} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
                </div>
                <p className="text-xs text-slate-300 mb-3 leading-relaxed">{componentData[selectedComponent].desc}</p>

                <div className="space-y-2 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  {componentData[selectedComponent].voltage && (
                    <div className="flex justify-between"><span className="text-slate-400">Tensão Operacional:</span><span className="font-mono text-sky-300">{componentData[selectedComponent].voltage}</span></div>
                  )}
                  {componentData[selectedComponent].power && (
                    <div className="flex justify-between"><span className="text-slate-400">Potência Nominal:</span><span className="font-mono text-emerald-300">{componentData[selectedComponent].power}</span></div>
                  )}
                  {componentData[selectedComponent].temp && (
                    <div className="flex justify-between"><span className="text-slate-400">Temperatura Estimada:</span><span className="font-mono text-amber-300">{componentData[selectedComponent].temp}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-slate-400">Status Operacional:</span><span className="font-mono text-indigo-300">{componentData[selectedComponent].status}</span></div>
                </div>
              </div>
            )}
          </div>
