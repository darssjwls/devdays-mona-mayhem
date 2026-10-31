<!-- l10n-sync: source-file="workshop/05-polish.md" -->
# Parte 5: Polimento e trabalho paralelo

---

Agora que o aplicativo funciona e está com boa aparência, é hora de aprimorá-lo. Nesta parte, você vai dividir o trabalho para melhorar a responsividade, o tratamento de erros e a qualidade sem fazer tudo em um único fluxo sequencial.

<!-- track:vscode:start -->
## Tarefa 1: Agente em segundo plano para design responsivo

1. No painel de Chat, clique em **+** para iniciar um novo chat.
2. Na parte inferior da janela, altere **Local** para **Copilot CLI**.
3. Insira este prompt:

   ```
   Add responsive CSS media queries: at 1024px switch comparison to single column,
   at 768px reduce font sizes, stack inputs vertically, and make the layout
   mobile-friendly. Also improve keyboard accessibility — ensure tab order works,
   Enter triggers battle, and focus states are visible.
   ```

4. Deixe o agente trabalhar em segundo plano — não é necessário acompanhá-lo.
5. Quando terminar, **revise** as alterações e clique em **Apply**.

## Tarefa 2: Agente em segundo plano para UX de erros

1. Inicie outro agente em segundo plano.
2. Insira este prompt:

   ```
   Improve the error experience: add a shake animation for errors, styled error
   messages with red (#ff3366) neon glow effects matching the arcade theme, and
   better input validation feedback. Show clear error messages when usernames are
   empty or invalid.
   ```

3. Revise as alterações quando o agente terminar e clique em **Apply**.

## Tarefa 3: Agente na nuvem para variações (opcional)

1. No painel de Chat, clique em **+** para iniciar um novo chat.
2. Na parte inferior da janela, altere **Local** para **Cloud**.
3. Insira este prompt:

   ```
   Create an alternative color theme for the battle page — keep the retro arcade
   style but use blue (#00f5ff) and orange (#ff6b35) instead of green and purple.
   Create it as a CSS custom property theme that could be toggled.
   ```

4. Consulte as **sessões de agentes** para acompanhar o progresso.
5. Revise a variação de design na PR criada pelo agente na nuvem.

## Tarefa 4: Verifique tudo
<!-- track:vscode:end -->

<!-- track:cli:start -->
## Tarefa 1: Divida o trabalho com `/fleet`

No Copilot CLI, use `/fleet` para dividir o trabalho entre subagentes em paralelo e depois revisar o resultado combinado:

```text
/fleet Improve the app in parallel:
1. Add responsive CSS media queries so the comparison collapses to one column at 1024px and the inputs stack on small screens.
2. Improve keyboard accessibility and focus visibility.
3. Improve the error experience with stronger validation feedback and arcade-style neon error states.
```

Deixe o CLI coordenar o trabalho e inspecione o resultado combinado com `/diff` antes de aprovar as alterações.

## Tarefa 2: Delegue uma variação (opcional)

Se quiser experimentar um fluxo assíncrono na nuvem, delegue uma variação de design:

```text
/delegate Create an alternative color theme for the battle page that keeps the retro arcade look but swaps in blue (#00f5ff) and orange (#ff6b35). Make it easy to toggle.
```

A tarefa delegada deve criar uma pull request que você poderá revisar separadamente enquanto continua trabalhando localmente.

## Tarefa 3: Faça uma revisão agêntica

Antes de encerrar, peça ao Copilot CLI para revisar o trabalho:

```text
/review Focus on potential bugs, accessibility issues, and UX regressions in the current branch.
```

Revise os resultados e corrija o que considerar necessário. Depois, execute `/diff` novamente para conferir as alterações.

## Tarefa 4: Verifique tudo
<!-- track:cli:end -->

> **⚠️ Não está vendo as alterações?** Se alguma das melhorias não aparecer, pare o servidor (`Ctrl+C`), reinicie com `npm run dev` e atualize a página forçadamente (`Ctrl+Shift+R`) no navegador.

Execute estes testes para confirmar que tudo funciona:

| Teste | Resultado esperado |
|-------|--------------------|
| Campos vazios e clique em Battle | Erro estilizado com animação de tremor |
| Nomes de usuário válidos | Gráficos de contribuições exibidos |
| Nome de usuário inválido | Erro da API com estilo retrô |
| Tecla Enter em um campo | Inicia a batalha |
| Tela estreita | Layout responsivo de coluna única |
| Passar o cursor sobre os quadrados de contribuições | Tooltip com data e contagem |

Compile para produção e confirme que não há erros:

```bash
npm run build && npm run preview
```

Quando tudo estiver como esperado, faça commit das alterações.

---

## ✅ Parte 5 concluída!

**O que você aprendeu:**

- Dividir o trabalho de polimento em **tarefas paralelas menores**
- Revisar as alterações geradas antes de incorporá-las à branch principal
- Usar o Copilot para **verificações de qualidade e explorações opcionais**, não apenas para implementar
