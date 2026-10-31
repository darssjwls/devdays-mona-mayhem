<!-- l10n-sync: source-file="workshop/00-overview.md" -->
# 🎮 Mona Mayhem — Workshop de GitHub Copilot

---

> **Duração:** ~1 hora  
> **Nível:** Intermediário  
> **Stack:** Astro / Node.js / TypeScript

Crie um aplicativo de arcade retrô para comparar contribuições do GitHub — **Mona Mayhem** — enquanto aprende toda a variedade de fluxos de trabalho do GitHub Copilot. O workshop oferece **duas trilhas**: uma com VS Code e outra com GitHub Copilot CLI.

---

## 🎯 Escolha sua trilha

- **Trilha VS Code** — trabalhe no editor e pratique Chat, Plan Mode, Agent Mode, agentes em segundo plano e o ciclo de revisão integrado.
- **Trilha CLI** — trabalhe no terminal e pratique `copilot`, contexto com `@file`, `/plan`, edições autônomas, `/fleet`, `/delegate` e `/review`.

Siga a trilha que melhor combina com seu fluxo de trabalho.

---

## 📋 Checklist rápido

Antes de começar, verifique:

- [ ] O GitHub Copilot está habilitado para sua conta
- [ ] O Node.js está instalado
- [ ] O Git está instalado e configurado
- [ ] Seu navegador e terminal estão prontos

<!-- track:vscode:start -->
- [ ] VS Code **v1.107+** (sem atualizações pendentes)
- [ ] Você entrou na extensão **GitHub Copilot**
- [ ] O painel de Chat está aberto e o Agent está pronto
<!-- track:vscode:end -->

<!-- track:cli:start -->
- [ ] O GitHub Copilot CLI está instalado e disponível como `copilot`
- [ ] Você entrou no CLI com `/login`
- [ ] Você se sente à vontade com comandos slash como `/help`, `/plan` e `/review`
<!-- track:cli:end -->

> 💡 **Dica:** Use o DevContainer para ter um ambiente pré-configurado e começar rapidamente no VS Code.

---

## 🧠 O que você vai aprender

| # | Habilidade | Descrição |
|---|------------|-----------|
| 1 | **Engenharia de contexto** | Ensinar ao Copilot sobre sua base de código com instruções, referências e restrições claras |
| 2 | **Planejar primeiro** | Projetar a arquitetura antes da implementação |
| 3 | **Implementação agêntica** | Deixar o Copilot realizar tarefas de programação em várias etapas sob sua supervisão |
| 4 | **Design iterativo** | Usar o Copilot para transformar o visual e aprimorar detalhes de interação |
| 5 | **Fluxos de trabalho paralelos** | Dividir o trabalho entre agentes, sessões ou tarefas delegadas |

<!-- track:vscode:start -->
### Recursos do VS Code

- **Chat + modo Ask** para exploração
- **Plan Mode** para criar prompts de arquitetura e design
- **Agent Mode** para implementar alterações em vários arquivos
- **Agentes em segundo plano e na nuvem** para polir em paralelo
<!-- track:vscode:end -->

<!-- track:cli:start -->
### Recursos do Copilot CLI

- **Sessões interativas do CLI** com `copilot`
- **`/plan` e Shift+Tab** para planejamento estruturado
- **Edições autônomas** com aprovações inline e `/diff`
- **`/fleet`, `/delegate` e `/review`** para paralelismo e verificações de qualidade
<!-- track:cli:end -->

---

## 📚 Partes do workshop

| Parte | Título | Descrição |
|------|-------|-----------|
| [**01**](01-setup.md) | Configuração e engenharia de contexto | Crie seu repositório, prepare o ambiente e forneça o contexto adequado ao Copilot |
| [**02**](02-plan-and-scaffold.md) | Planejamento e estrutura inicial | Projete a API e a arquitetura das páginas antes de implementá-las |
| [**03**](03-agent-mode.md) | Construção do jogo | Conecte a página de batalha e os gráficos de contribuições com ajuda agêntica |
| [**04**](04-design-vibes.md) | Design e temas | Transforme a estrutura inicial em uma experiência de arcade retrô |
| [**05**](05-polish.md) | Polimento e trabalho paralelo | Use fluxos multiagente para melhorar UX, resiliência e qualidade |
| [**06**](06-bonus.md) | Bônus e extensões | Explore funcionalidades abertas, formas de compartilhar e experimentos extras |

---

## 💡 Dicas profissionais

1. **Mantenha o navegador aberto** — acompanhe as atualizações em tempo real enquanto programa.
2. **Faça commits com frequência** — salve pontos de verificação organizados durante as iterações.
3. **Aprimore o plano antes da implementação** — planos melhores levam a resultados melhores.
4. **Revise as alterações do Copilot** — use a visualização de diff ou as ferramentas de revisão do CLI em vez de aceitar tudo sem conferir.

<!-- track:vscode:start -->
5. **Use pontos de verificação e Desfazer** no chat se uma iteração sair do rumo.
<!-- track:vscode:end -->

<!-- track:cli:start -->
5. **Use `/session`, `/context` e `/share file`** para inspecionar ou preservar seu trabalho.
<!-- track:cli:end -->
