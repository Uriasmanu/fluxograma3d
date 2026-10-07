# Roadmap

Visão geral das partes do projeto `fluxograma3d`. Atualize a tabela sempre que uma spec, um plano ou o status de uma parte mudar.

| Parte | Tema | Spec | Plano | Status |
|---|---|---|---|---|
| 1 | Pátio de subestação 3D: cena estilizada, vista de cima, com pessoas e sala de monitoramento | [spec](superpowers/specs/2026-10-07-parte-1-patio-3d-design.md) | [plano](superpowers/plans/2026-10-07-parte-1-patio-3d.md) | Plano escrito, aguardando revisão |
| 2 em diante | A definir | — | — | Aguardando a descrição do restante da ideia |

## Parte 1: pontos que as próximas partes podem reaproveitar

Estas escolhas da Parte 1 foram feitas para que outras partes possam se apoiar nelas. Elas continuam sujeitas à revisão de cada nova spec.

- **Layout em dados:** o pátio inteiro é descrito em `src/data/yard.ts`. Mudar o layout não exige mexer em componentes.
- **Terminais por tipo de equipamento:** `src/data/terminals.ts` define onde cada equipamento se conecta. Qualquer funcionalidade que precise de "caminho entre equipamentos" (por exemplo, o fluxo de energia que ficou fora da Parte 1) pode partir das `connections` do `Yard`.
- **Registro de equipamentos:** `src/scene/equipment/registry.tsx` mapeia o tipo para o componente. Um tipo novo entra com um componente e uma entrada em `terminals.ts`.
- **Pontos de vista:** `src/data/viewpoints.ts` e o `CameraRig` já formam um mecanismo de navegação guiada.
- **Ficou de fora da Parte 1, de propósito:** animação do fluxo de energia, painel de informações e seleção de equipamentos, dados em tempo real e modelos `.glb`.

## Como registrar uma parte nova

1. Adicione uma linha na tabela, com o tema e o status "Em brainstorming".
2. Siga o fluxo descrito no [README](README.md).
3. Se a parte nova mudar algo que a Parte 1 criou (por exemplo, o modelo de dados do `Yard`), diga isso explicitamente na spec da nova parte.
