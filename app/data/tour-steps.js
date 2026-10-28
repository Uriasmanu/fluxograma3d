    // --- Tour guiado: como a Treetech, os módulos, o E3, o Sync e o Sigma ECM se encaixam ---
    const TOUR_STEPS = [
      {
        title: 'A Treetech',
        text: 'A Treetech fabrica módulos, que são as peças instaladas na subestação e nos transformadores, e também criou o software que monitora esses módulos: o Sigma ECM.',
        camera: { position: [100, 55, 75], target: [38, 0, 14] },
        mode: 'sync',
        roofs: { plant: false, treetech: false, factory: false },
        labels: ['factory', 'treetech', 'substation']
      },
      {
        title: 'A fábrica de módulos',
        text: 'No galpão da Treetech os módulos são montados na linha de produção. Atrás dela ficam as salas de desenvolvimento de protótipos: eletrônica, testes e ensaios, e projeto.',
        camera: { position: [68, 16, 47], target: [54, 1, 33] },
        mode: 'sync',
        roofs: { plant: false, treetech: false, factory: true },
        labels: ['factory']
      },
      {
        title: 'A reunião com o cliente',
        text: 'Tudo começa numa sala de reunião. O cliente conversa com a equipe da Treetech e pede três coisas: os módulos, o Sigma ECM (o site de monitoramento) e a instalação no transformador. Eles apertam as mãos e o negócio está fechado.',
        camera: { position: [57.2, 23.1, 18], target: [55.9, 20.2, 6.5] },
        mode: 'sync',
        roofs: { plant: false, treetech: true, factory: false },
        labels: []
      },
      {
        title: 'Os desenvolvedores configuram o módulo',
        text: 'Antes de sair da Treetech, a equipe de desenvolvimento configura o módulo: escreve o script de mapeamento (SQL), define o E3, em que o Sigma consulta o módulo por TCP/IP, e o Sync, em que o módulo publica no RabbitMQ. As telas alternam entre os três.',
        camera: { position: [54.6, 13.2, 21], target: [54.6, 7.8, 6.2] },
        mode: 'sync',
        roofs: { plant: false, treetech: true, factory: false },
        labels: []
      },
      {
        title: 'A Treetech entrega e instala',
        text: 'Com o negócio fechado e o módulo configurado, a Treetech disponibiliza os módulos, instala nos equipamentos do transformador e acompanha a operação. Da fábrica até a subestação, tudo é feito por ela.',
        camera: { position: [26, 42, 62], target: [26, 0, 19.5] },
        mode: 'sync',
        roofs: { plant: false, treetech: false, factory: false },
        labels: ['factory', 'substation']
      },
      {
        title: 'Os módulos instalados',
        text: 'Na subestação, os módulos ficam presos aos equipamentos. TM mede a temperatura do transformador, BM monitora as buchas, GMP mede gás e umidade do óleo e DM captura o estado dos contatos dos disjuntores.',
        camera: { position: [16, 10, 15], target: [1, 1.8, 0.2] },
        mode: 'sync',
        roofs: { plant: false, treetech: false, factory: false },
        labels: ['tm', 'bm', 'gmp', 'dm1', 'dm2']
      },
      {
        title: 'Forma 1: E3 (TCP/IP)',
        text: 'No E3, o Sigma pergunta ao módulo, por TCP/IP, se há informação nova. A câmera acompanha uma pergunta (azul) até o módulo e a resposta (verde) de volta, até o banco de dados e o painel do Sigma.',
        camera: { position: [66, 8, 12], target: [56, 2, 6] },
        mode: 'e3',
        follow: 'e3',
        roofs: { plant: false, treetech: true, factory: false },
        labels: []
      },
      {
        title: 'Forma 2: Sync (RabbitMQ)',
        text: 'No Sync, o módulo envia a atualização por conta própria, pela internet. A câmera acompanha uma mensagem (laranja) até a fila do RabbitMQ, onde ela espera, e depois até o Sigma, o banco de dados e o painel.',
        camera: { position: [8, 6, 10], target: [2, 2, 2] },
        mode: 'sync',
        follow: 'sync',
        roofs: { plant: false, treetech: true, factory: false },
        labels: []
      },
      {
        title: 'O banco de dados',
        text: 'Nas duas formas, a informação recebida é salva no banco de dados, que pode ser PostgreSQL ou SQL Server. A cena mostra os dois, e o que está em uso fica destacado em verde.',
        camera: { position: [70, 5, 10], target: [60.9, 0.9, 3.5] },
        mode: 'sync',
        roofs: { plant: false, treetech: false, factory: false },
        labels: ['db1', 'db2']
      },
      {
        title: 'Sigma ECM',
        text: 'Por fim, as informações aparecem no Sigma ECM, em telas como este painel da Treetech. Os usuários também acessam o Sigma pelos PCs dos escritórios, como o da usina.',
        camera: { position: [52, 17, 17.5], target: [52, 14.4, 5.7] },
        mode: 'sync',
        roofs: { plant: false, treetech: true, factory: false },
        labels: ['sigma', 'plant']
      },
      {
        title: 'Energia garantida para a cidade',
        text: 'Toda essa infraestrutura garante o abastecimento de energia elétrica da cidade: os módulos vigiam o transformador e os disjuntores, o Sigma ECM avisa a equipe antes de uma falha e a Treetech instala e acompanha tudo, da fábrica até a subestação.',
        camera: { position: [96, 50, 24], target: [34, 0, -10] },
        mode: 'sync',
        roofs: { plant: false, treetech: false, factory: false },
        labels: ['substation', 'treetech', 'plant']
      }
    ];
