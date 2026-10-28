      // Alternar Estado do Disjuntor Principal
      const toggleBreaker = () => {
        const newState = !breakerClosed;
        setBreakerClosed(newState);

        if (!newState) {
          setAlarms(prev => [
            { id: Date.now(), msg: "ALERTA: Disjuntor Principal Abertura de Emergência!", time: new Date().toLocaleTimeString() },
            ...prev
          ]);
        } else {
          setAlarms(prev => [
            { id: Date.now(), msg: "SISTEMA: Disjuntor Reagrupado e Energizado.", time: new Date().toLocaleTimeString() },
            ...prev
          ]);
        }
      };
