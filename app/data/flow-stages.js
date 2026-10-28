    // Etapas do pacote que a câmera acompanha no E3 e no Sync (índices usados por `stage` nos trechos da simulação)
    const FLOW_STAGES = {
      e3: ['Sigma pergunta', 'TCP/IP até o módulo', 'Módulo responde', 'TCP/IP de volta', 'Banco de dados', 'Painel Sigma'],
      sync: ['Módulo envia', 'Internet até a Treetech', 'Fila RabbitMQ', 'Sigma retira', 'Banco de dados', 'Painel Sigma']
    };
    const FLOW_CAPTIONS = {
      e3: [
        'O Sigma, no servidor da Treetech, pergunta ao módulo: há informação nova?',
        'A pergunta viaja por TCP/IP: antena da Treetech, antena da subestação e módulo.',
        'O módulo responde com a leitura.',
        'A resposta volta pelo mesmo caminho até o servidor.',
        'O Sigma grava a leitura no banco de dados.',
        'A informação aparece no painel do Sigma ECM.'
      ],
      sync: [
        'O módulo envia a atualização por conta própria, sem ser perguntado.',
        'A mensagem viaja pela internet até a Treetech.',
        'Ela entra na fila do RabbitMQ e espera a sua vez.',
        'O Sigma retira a mensagem da fila.',
        'O Sigma grava a leitura no banco de dados.',
        'A informação aparece no painel do Sigma ECM.'
      ]
    };
