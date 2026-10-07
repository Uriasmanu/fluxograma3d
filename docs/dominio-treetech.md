# Domínio: Treetech, módulos e monitoramento (E3 e Sync)

Este documento explica o que a cena 3D representa. Ele separa três coisas: o que o usuário explicou, o que foi confirmado em fontes públicas e o que é suposição. Atualize-o junto com a cena.

## 1. A explicação do usuário

> Fonte: explicação dada pelo usuário. Os pontos desta seção sobre E3, Sync/RabbitMQ e o banco de dados **não foram confirmados em fontes públicas** (ver seção 2).

- A **Treetech** é uma empresa que **produz módulos**, as peças que vão na estação de energia (subestação) e nos transformadores. Além disso, ela **fez o software que monitora esses módulos**.
- Há **duas formas de monitorar**:
  - **E3**: comunicação TCP/IP. O software **pergunta ao módulo** se há informações para atualizar. É um modelo de consulta (*polling*).
  - **Sync (RabbitMQ)**: o software **recebe do módulo** as informações de atualização. É um modelo de publicação (*push*) por fila de mensagens.
- **Independentemente da forma**, as informações são **salvas em um banco de dados**, que pode ser **PostgreSQL ou SQL Server**, e são **exibidas no software Sigma ECM**.

### Fluxos

```
E3    (consulta)   Sigma  ── "tem algo novo?" ──▶  Módulo
                   Sigma  ◀── resposta/dados ────  Módulo         (TCP/IP)

Sync  (publicação) Módulo ── atualização ──▶ RabbitMQ ──▶ Sigma   (fila de mensagens)

Nos dois casos:    Sigma ──▶ Banco de dados (PostgreSQL ou SQL Server) ──▶ tela do Sigma ECM
```

## 2. O que foi confirmado em fontes públicas

- A Treetech é uma empresa brasileira de tecnologia para redes elétricas inteligentes (smart grid), sediada em Atibaia (SP), que se apresenta como líder mundial em tecnologia de monitoramento de buchas. Fonte: [site da Treetech](https://www.treetech.com.br).
- Ela fabrica **sensores inteligentes (Smart Devices)** para transformadores e subestações. Alguns citados no site e nos casos publicados: monitores de temperatura **TM1 e TM2**, monitores de buchas **BM, BMM e SDB**, monitores de gás e umidade **GMP e GMP-2**, supervisor de paralelismo **SPS**, módulo de captura e controle de contatos **DM**, e módulos de gateway e controle (**SDG**). Fontes: [site da Treetech](https://www.treetech.com.br), [caso Trafo](https://treetech.com.br/en/sigma-monitoring-system-for-trafo-equipamentos-eletricos-sa/).
- O software de monitoramento é o **Sigma ECM** (diagnóstico e prognóstico de ativos); há também o **Sigma EAM** (gestão de ativos). Fonte: [site da Treetech](https://www.treetech.com.br).
- O **Sigma 4.0** reformulou a plataforma com a DB1: arquitetura modular com **plugins**, camada de visualização separada das regras de negócio, regras de negócio em **API RESTful** e algoritmos de engenharia em **C# e Python**. Fonte: [Baguete, 2022](https://www.baguete.com.br/noticias/treetech-reformula-ecm-com-db1).
- A arquitetura típica do Sigma, em um caso publicado (Eletrosul), tem três partes: **captura de dados** (sensores do tipo IED no pátio, como monitores de temperatura, de buchas, de gás e de umidade), **meios de comunicação** (RS485 entre os sensores e o servidor, depois ampliado com Wi-Fi; protocolos abertos como Modbus, DNP 3.0, TCP/IP e OPC) e **armazenamento, tratamento e disponibilização** (um servidor de monitoramento na sala de controle da subestação, acessado pela intranet, com interface web por HTTPS). Fonte: [Evolução do Sigma na Eletrosul](https://treetech.com.br/en/evolution-of-the-sigma-online-monitoring-systems-for-transformers-and-reactors-at-eletrosul/).

### O que não foi encontrado

- Nada público sobre o protocolo **E3** da Treetech nem sobre o **Sync com RabbitMQ**. O "E3" que aparece nas buscas é um monitor de transformadores da **Amperis**, sem relação com o Sigma.
- Nada público sobre o uso de **PostgreSQL ou SQL Server** pelo Sigma.
- Por isso as seções 1 e 4 dependem da explicação do usuário. Se houver documentação interna, ela deve substituir a suposição.

## 3. Decisões do usuário para a cena

| Pergunta | Decisão |
|---|---|
| Onde ficam o RabbitMQ, o Sigma e o banco de dados? | **Tudo na Treetech**: o servidor da Treetech tem o RabbitMQ, o Sigma e o banco. A usina e a subestação só enviam dados e acessam a tela |
| Como explicar os dois caminhos (E3 e Sync) no 3D? | **Tour guiado passo a passo** |
| Como são os caminhos entre a Treetech e a subestação? | **Estrada com vans** levando módulos e voltando |
| Quais módulos aparecem nos equipamentos? | **Os quatro**: TM (temperatura), BM (buchas), GMP (gás e umidade) e DM (contatos) |

## 4. Como a cena 3D representa isso

> Os itens marcados com "?" são interpretações sujeitas à confirmação do usuário.

| Na cena | Representa |
|---|---|
| **Subestação de 138 kV** | O local onde os módulos da Treetech ficam instalados |
| Caixas brancas com faixa verde e LED (TM, BM, GMP, DM 1, DM 2) | Os **módulos da Treetech** nos equipamentos: TM no tanque do transformador, BM no topo, perto das buchas, GMP ao lado do transformador (com um tubo até o óleo) e DM nos dois disjuntores. O LED pisca em branco quando o módulo se comunica |
| **Galpão com linha de produção** | A **fábrica de módulos** da Treetech: esteira com módulos, funcionários na montagem e um supervisor, com caixas de módulos na entrada |
| **Estrada com duas vans** | O transporte dos módulos da fábrica até o portão sul da subestação. Elas saem carregadas e voltam vazias |
| **Escritório da Treetech, com a torre do servidor** | O servidor da Treetech, que roda o RabbitMQ, o Sigma e o banco de dados |
| **Tubo de vidro com pilha de caixas laranja** | A **fila do RabbitMQ**; a altura da pilha é a profundidade da fila |
| **Dois cilindros (PostgreSQL e SQL Server)** | O **banco de dados**. O que está em uso fica destacado em verde e alterna a cada 14 s para mostrar as duas opções |
| **Painel de 4 × 2 telas na sala anexa** | O **Sigma ECM** exibindo as informações |
| **Antenas na subestação e na Treetech, com arcos de luz** | A **rede TCP/IP** entre os módulos e o servidor (desenho esquemático, não o meio físico real) |
| **Usina, com o escritório e os PCs** | A empresa de energia, cliente da Treetech? Os PCs do escritório são **usuários do Sigma ECM**? Eles têm cabos até o servidor da Treetech |
| **Cidade, torres de transmissão e postes de luz** | Os consumidores e a rede que a subestação alimenta |

### Cores dos pacotes

| Cor | Significado |
|---|---|
| Azul | Pergunta: o Sigma consulta o módulo (E3), ou um usuário abre o Sigma |
| Verde | Resposta: o módulo responde (E3), ou o Sigma responde ao usuário |
| Laranja | Mensagem: o módulo envia a atualização (Sync) e ela segue pela fila até o banco e o painel |

### O que acontece em cada forma

- **E3**: a cada 1,4 s o Sigma consulta um módulo, um de cada vez (TM, BM, GMP, DM 1 e DM 2, em rodízio). A pergunta sai do servidor, passa pela antena da Treetech e pela da subestação e chega ao módulo. A resposta volta pelo mesmo caminho, é gravada no banco e aparece no painel. A fila do RabbitMQ não é usada.
- **Sync**: cada módulo envia uma atualização a cada 3 a 7 s, por conta própria. A mensagem passa pelas antenas e entra na fila do RabbitMQ. O Sigma retira da fila, grava no banco e a informação aparece no painel.

### Suposições a confirmar

- Os PCs do escritório da usina são **usuários do Sigma ECM**, e não máquinas que publicam no RabbitMQ.
- Os módulos se ligam ao servidor por uma rede que passa por antenas, só para o desenho ser claro. No mundo real a topologia pode ser diferente (por exemplo, um gateway na subestação).
- Os valores do painel (temperatura, umidade, taxa de mensagens) são simulados.

## 5. Como usar o tour

O botão **Tour: como funciona**, no canto esquerdo, leva a câmera por oito passos, com um texto curto em cada um:

1. **A Treetech**: fabrica módulos e também fez o software que os monitora.
2. **A fábrica de módulos**: o galpão com a linha de produção.
3. **Da fábrica à subestação**: as vans na estrada, indo e voltando.
4. **Os módulos instalados**: TM, BM, GMP e DM nos equipamentos.
5. **Forma 1: E3 (TCP/IP)**: o Sigma pergunta, o módulo responde.
6. **Forma 2: Sync (RabbitMQ)**: o módulo envia, a fila guarda, o Sigma retira.
7. **O banco de dados**: PostgreSQL ou SQL Server.
8. **Sigma ECM**: a exibição no painel e nos PCs dos escritórios.

Os passos 5 e 6 trocam o modo de comunicação da cena. Fora do tour, a cena fica no modo Sync.

## 6. Glossário

| Termo | Significado |
|---|---|
| Módulo / Smart Device | Sensor ou dispositivo da Treetech instalado no transformador ou na subestação, que mede (temperatura, buchas, gás, umidade etc.) |
| TM | Monitor de temperatura |
| BM | Monitor de buchas |
| GMP | Monitor de gás e umidade do óleo |
| DM | Módulo de captura e controle de contatos (por exemplo, o estado do disjuntor) |
| IED | Dispositivo eletrônico inteligente; o tipo de sensor usado no pátio |
| Sigma ECM | Software da Treetech de monitoramento, diagnóstico e prognóstico de ativos |
| E3 | Forma de monitorar por TCP/IP em que o software consulta o módulo (segundo o usuário) |
| Sync | Forma de monitorar em que o módulo publica as atualizações por RabbitMQ (segundo o usuário) |
| RabbitMQ | Broker de mensagens: recebe mensagens de produtores, guarda em filas e entrega a consumidores |
| Polling | O cliente pergunta periodicamente se há novidade |
| Push | A origem envia a informação assim que ela existe |
