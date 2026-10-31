<!-- l10n-sync: source-file="workshop/01-setup.md" -->
# Parte 1: Configuração e engenharia de contexto

---

Nesta parte, você vai configurar seu ambiente de desenvolvimento **e** ensinar ao Copilot sobre a base de código — para que cada prompt futuro comece com o contexto adequado.

## Seção 1: Configuração inicial

### Passo 1: Crie seu repositório

1. Abra [github.com/copilot-dev-days/mona-mayhem](https://github.com/copilot-dev-days/mona-mayhem).
2. Crie seu próprio repositório de uma destas formas:
   - clique em **Use this template** → **Create a new repository**, ou
   - faça um fork deste repositório.
3. Dê a ele o nome `my-mona-mayhem` e defina a visibilidade como **Public** (se você o criou a partir do template).

<!-- track:vscode:start -->
### Passo 2: Escolha seu ambiente de desenvolvimento

#### Opção A: VS Code local

1. Abra o VS Code e execute **Git: Clone** → **Clone from GitHub**.
2. Selecione seu repositório `my-mona-mayhem`.
3. Quando solicitado, instale as **extensões recomendadas**.

#### Opção B: GitHub Codespaces

1. Abra seu repositório no GitHub.
2. Clique em **Code** → **Codespaces** → **Create codespace on main**.
3. Aguarde o ambiente iniciar e as dependências serem instaladas.

### Passo 3: Instale as dependências e inicie o aplicativo

1. Abra o terminal integrado no seu repositório.
2. Instale as dependências:

   ```bash
   npm install
   ```

3. Inicie o aplicativo:

   ```bash
   npm run dev
   ```

> ✅ **O aplicativo já está aberto no seu navegador!**
<!-- track:vscode:end -->

<!-- track:cli:start -->
### Passo 2: Instale o GitHub Copilot CLI

Use o método de instalação adequado para sua máquina:

- **npm (multiplataforma; requer Node.js 22+)**

  ```bash
  npm install -g @github/copilot
  ```

- **Homebrew (macOS/Linux)**

  ```bash
  brew install copilot-cli
  ```

- **WinGet (Windows)**

  ```bash
  winget install GitHub.Copilot
  ```

### Passo 3: Inicie o aplicativo e autentique o CLI

1. Clone seu repositório localmente e abra um terminal na raiz do projeto.
2. Instale as dependências e inicie o aplicativo:

   ```bash
   npm install
   npm run dev
   ```

3. Abra um **segundo terminal** no mesmo repositório e inicie o Copilot CLI:

   ```bash
   copilot
   ```

4. Na sessão interativa, digite:

   ```
   /login
   ```

5. Siga as instruções do fluxo de autenticação por dispositivo e confirme que confia no repositório quando o CLI solicitar aprovação.

> ✅ **Agora você tem a prévia do aplicativo em um terminal e o Copilot CLI pronto em outro.**
<!-- track:cli:end -->

## Seção 2: Engenharia de contexto

A engenharia de contexto é como você ensina a IA sobre sua base de código. Quanto melhor o contexto, melhores serão as respostas futuras.

<!-- track:vscode:start -->
### Tarefa 1: Gere instruções do workspace com /init

Use o comando integrado `/init` para gerar um arquivo de instruções do workspace para o Copilot:

1. Abra o **Copilot Chat** e digite:

   ```
   /init simple instructions with a project overview, build/dev commands, and Astro best practices, (ignore the workshop).
   ```

2. Revise o arquivo gerado: o Copilot analisará o projeto e criará `.github/copilot-instructions.md`.
3. Aceite as alterações e faça **commit** do arquivo de instruções.

> **Resultado:** As futuras solicitações ao Copilot incluirão um mapa do seu workspace.

### Tarefa 2: Agentes em segundo plano

**Agente local em segundo plano:**

1. No painel de Chat, clique em **+** para iniciar um novo chat.
2. Na parte inferior da janela, altere **Local** para **Copilot CLI**.
3. Insira este prompt:

   > "Add linting rules for unused vars and improve code style; fix any errors"

4. Quando terminar, **revise e aplique** as alterações; depois, arquive a sessão se quiser.

**Agente na nuvem:**

1. No painel de Chat, clique em **+** para iniciar um novo chat.
2. Na parte inferior da janela, altere **Local** para **Cloud**.

   > "Make the README more engaging as a landing page"

> **Resultado:** Regras de lint são adicionadas, erros são corrigidos e o README melhora, tudo sem sair do editor.

### Tarefa 3: Explore o projeto

Abra o **Copilot Chat** no **modo Ask** e experimente estes prompts:

- `"Explain the architecture of this project"`
- `"What files are in the src directory and what do they do?"`
- `"What would I need to build to make the Battle button work?"`

> 💡 Use **@workspace** para fornecer ao Copilot o contexto de todo o projeto e obter respostas mais precisas.
<!-- track:vscode:end -->

<!-- track:cli:start -->
### Tarefa 1: Gere instruções do repositório com /init

Use `/init` para gerar um arquivo de instruções do workspace para o Copilot:

1. No Copilot CLI, digite:

   ```
   /init simple instructions with a project overview, build/dev commands, and Astro best practices, (ignore the workshop).
   ```

2. Revise o arquivo gerado: o Copilot analisará o projeto e criará `.github/copilot-instructions.md`.
3. Faça commit do arquivo de instruções.

> **Resultado:** As futuras sessões do CLI herdarão automaticamente as instruções específicas do repositório em `.github/copilot-instructions.md`.

### Tarefa 2: Ajuste seu ambiente do CLI

Pratique os controles do CLI que facilitarão os próximos passos:

1. Execute `/help` para consultar os comandos slash disponíveis.
2. Use `/model` para ver os modelos disponíveis.
3. Se o Copilot tiver aprendido muitas aprovações durante os testes, redefina-as com:

   ```
   /reset-allowed-tools
   ```

4. Se o repositório estiver dentro de um diretório pai maior, use `/add-dir PATH` para ampliar explicitamente o workspace permitido.

> 💡 A documentação do CLI recomenda instruções personalizadas concisas e permissões explícitas de ferramentas para manter o Copilot rápido e previsível.

### Tarefa 3: Explore o projeto pelo terminal

Experimente estes prompts no Copilot CLI:

- `Give me an overview of this project.`
- `@src/pages/api/contributions/[username].ts What is this file for and what needs to be built here?`
- `@src/pages/index.astro What exists here and what would I need to add to build the battle page?`

Para obter rapidamente uma resposta única fora da sessão interativa, experimente:

```bash
copilot -p "Summarize the architecture of this repo in 5 bullet points"
```

> **Resultado:** Agora você tem instruções, conhece os comandos e sabe como fornecer arquivos como contexto ao Copilot CLI.
<!-- track:cli:end -->

## ✅ Parte 1 concluída

Você aprendeu a:

- **Configurar** o repositório e o ambiente de desenvolvimento local
- **Gerar instruções** com `/init` para que o Copilot entenda o projeto e sua direção de design
- **Criar o hábito de revisar** as alterações antes de aplicá-las
- **Explorar a base de código** com prompts que incluem contexto
