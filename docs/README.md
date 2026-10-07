# Documentação

O projeto é desenvolvido em **partes**. Cada parte tem a sua própria spec e o seu próprio plano de implementação, e o andamento geral fica no [roadmap](roadmap.md).

## Estrutura

```
docs/
  README.md                     # este índice e as convenções
  roadmap.md                    # todas as partes, com status e links
  superpowers/
    specs/                      # uma spec de design por parte
    plans/                      # um plano de implementação por parte
```

## Convenções

- **Nome dos arquivos:** `YYYY-MM-DD-parte-N-<tema>-design.md` para specs e `YYYY-MM-DD-parte-N-<tema>.md` para planos. O `N` é o número da parte no roadmap.
- **Idioma:** documentação em português do Brasil. Código e comentários de código em inglês.
- **Premissas:** o que ainda não foi confirmado fica marcado como **[PREMISSA]** na spec, até alguém confirmar ou corrigir.
- **Cada parte entrega algo que roda sozinho.** Uma parte nova não deve exigir reescrever a anterior.
- **Código compartilhado entre partes** é descrito na spec da parte que o criou, na seção de arquitetura, e referenciado pelas partes seguintes.

## Fluxo de uma parte nova

1. Descrever a parte no [roadmap](roadmap.md).
2. Fazer o brainstorming e escrever a spec em `superpowers/specs/`.
3. Revisar e aprovar a spec.
4. Escrever o plano em `superpowers/plans/`.
5. Executar o plano e atualizar o status no roadmap.
