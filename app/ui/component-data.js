      // Dados dos Componentes para inspeção técnica
      const componentData = {
        transformer: {
          title: "Transformador Principal de Potência (Trafo 01)",
          voltage: "138 kV / 13.8 kV",
          power: "50 MVA",
          temp: `${Math.round(55 + (loadLevel * 0.25))} °C`,
          status: breakerClosed ? "OPERACIONAL (EM CARGA)" : "DESENERGIZADO",
          desc: "Unidade central rebaixadora de tensão de óleo mineral com conservador externo e conjunto de radiadores de refrigeração forçada."
        },
        gantry: {
          title: "Pórtico Metálico e Barramento de Alta Tensão",
          voltage: "138 kV AC",
          power: `${Math.round(48 * (loadLevel/100))} MW`,
          temp: "32 °C",
          status: "ENERGIZADO (GRID)",
          desc: "Estrutura treliçada em aço galvanizado para ancoragem de cabos condutores de chegada e isoladores de disco tipo suspensão."
        },
        breaker_1: {
          title: "Disjuntor Principal a Gás SF6 - Baía AT",
          voltage: "138 kV",
          pressure: "6.2 bar (Gás SF6)",
          status: breakerClosed ? "FECHADO (CONDUZINDO)" : "ABERTO (ISOLADO)",
          temp: "38 °C",
          desc: "Disjuntor de alta velocidade com câmara de extinção de arco por sopro de SF6 para proteção contra curto-circuitos."
        },
        breaker_2: {
          title: "Conjunto de Disjuntores MT - Alimentadores",
          voltage: "13.8 kV",
          status: breakerClosed ? "FECHADO" : "ABERTO",
          temp: "35 °C",
          desc: "Módulos de interrupção em média tensão protegendo a saída dos circuitos de distribuição regional."
        },
        radiators: {
          title: "Bateria de Radiadores e Refrigeração (ONAF)",
          flow: `${Math.round(850 * (loadLevel/100))} L/min`,
          fans: loadLevel > 60 ? "4 Ventoínhas ATIVAS" : "2 Ventoínhas ATIVAS",
          temp: `${Math.round(42 + (loadLevel * 0.15))} °C`,
          status: "EM OPERAÇÃO",
          desc: "Trocadores de calor a óleo-ar para dissipação de perdas térmicas do núcleo do transformador."
        },
        cabinets: {
          title: "Armários de Comando, Proteção e SCADA",
          protocol: "IEC 61850 / DNP3",
          plcStatus: "CPU OK - S7-1500",
          temp: "26 °C",
          status: "SISTEMA ONLINE",
          desc: "Painéis metálicos IP65 contendo relés numéricos de proteção, controladores lógicos e RTU de automação."
        },
        arresters: {
          title: "Conjunto de Para-Raios de Óxido Metálico (ZnO)",
          mcov: "84 kV RMS",
          dischargeCount: "03 Eventos",
          status: "PROTEÇÃO ATIVA",
          temp: "28 °C",
          desc: "Dispositivos de proteção contra sobretensões atmosféricas e de manobra conectados ao barramento."
        }
      };
