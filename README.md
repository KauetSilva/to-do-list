# TodoList - Aplicação de Gerenciamento de Tarefas

![Todo List App](/web/public/todo-icon.svg)

Uma aplicação fullstack para gerenciamento de tarefas com funcionalidades completas e design responsivo.

## 📋 Conteúdo

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Recursos](#recursos)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação e Configuração](#instalação-e-configuração)
- [API Endpoints](#api-endpoints)
- [Componentes Frontend](#componentes-frontend)
- [Sistema de Internacionalização](#sistema-de-internacionalização)
- [Sistema de Notificações](#sistema-de-notificações)
- [Temas](#temas)
- [Segurança](#segurança)
- [Desenvolvimento Mobile](#desenvolvimento-mobile)

## 🔍 Visão Geral

TodoList é uma aplicação fullstack para gerenciamento de tarefas, permitindo que usuários criem uma conta, adicionem, editem, excluam e marquem tarefas como concluídas. A aplicação oferece uma interface de usuário intuitiva com suporte para múltiplos idiomas (português e inglês), tema claro/escuro e um sistema de notificações avançado.

## 🚀 Tecnologias

### Backend

- **NestJS**: Framework para construção do backend
- **Prisma**: ORM para interação com o banco de dados
- **SQLServer**: Banco de dados relacional
- **JWT**: Autenticação baseada em tokens
- **Swagger**: Documentação API
- **Jest**: Testes unitários e de integração

### Frontend

- **React**: Biblioteca para construção de interfaces
- **TypeScript**: Superset tipado do JavaScript
- **Vite**: Ferramenta de build rápida
- **TailwindCSS**: Framework CSS utilitário
- **Phosphor Icons**: Biblioteca de ícones
- **React Router Dom**: Navegação
- **Context API**: Gerenciamento de estados globais

## 💡 Recursos

### Gerenciamento de Usuários

- Registro e login de usuários
- Autenticação segura com JWT
- Persistência de sessão via localStorage

### Gerenciamento de Tarefas

- Criar, ler, atualizar e excluir tarefas (CRUD)
- Marcar tarefas como concluídas/pendentes
- Visualizar detalhes de tarefas
- Ordenação de tarefas por data (mais recentes primeiro)
- Indicadores visuais para status da tarefa (emojis)
- Opção para cancelar exclusão de tarefa em até 5 segundos

### UI/UX

- Design responsivo para desktop e dispositivos móveis
- Modo claro/escuro
- Suporte para português e inglês
- Sistema de notificações toast
- Indicadores de status das tarefas baseados em emojis
- Layout adaptativo para diferentes tamanhos de tela

### Dashboard de Performance

- Visualização de estatísticas de conclusão de tarefas
- Progresso de conclusão de tarefas
- Visão geral das tarefas recentes

## 🗂️ Estrutura do Projeto

O projeto é dividido em duas partes principais:

### Backend (`/api`)

```
/api
  /prisma           # Esquema de banco de dados e migrações
  /src
    /modules
      /user         # Módulo de usuários (autenticação, registro)
      /task         # Módulo de tarefas (CRUD)
      /auth         # Módulo de autenticação (JWT)
      /cache        # Módulo de cache
    /app.module.ts  # Módulo principal da aplicação
    /main.ts        # Ponto de entrada da aplicação
```

### Frontend (`/web`)

```
/web
  /public            # Recursos estáticos
  /src
    /components      # Componentes reutilizáveis
    /hooks           # Hooks personalizados (useLanguage, useTheme)
    /pages
      /Login         # Página de login
      /Register      # Página de registro
      /Tasks         # Página principal de tarefas
      /Performance   # Dashboard de performance
    /App.tsx         # Componente raiz
    /main.tsx        # Ponto de entrada
```

## ⚙️ Instalação e Configuração

### Pré-requisitos

- Node.js (v14+)
- npm ou yarn
- SQLServer

### Backend

1. Clone o repositório:

```bash
git clone https://github.com/KauetSilva/todo-list.git
cd todo-list/api
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
# Edite .env com suas configurações de banco de dados e JWT
```

4. Execute as migrações do Prisma:

```bash
npx prisma migrate dev
```

5. Inicie o servidor:

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:8000`.

### Frontend

1. Navegue até a pasta web:

```bash
cd ../web
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
# Configure a URL da API
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O frontend estará rodando em `http://localhost:5173`.

## 📡 API Endpoints

### Autenticação

| Método | Endpoint       | Descrição                |
| ------ | -------------- | ------------------------ |
| POST   | /user/register | Registra um novo usuário |
| POST   | /user/login    | Autentica um usuário     |

### Tarefas

| Método | Endpoint          | Descrição                                   |
| ------ | ----------------- | ------------------------------------------- |
| GET    | /tasks            | Retorna todas as tarefas do usuário         |
| POST   | /tasks            | Cria uma nova tarefa                        |
| PUT    | /tasks/:id        | Atualiza uma tarefa                         |
| DELETE | /tasks/:id        | Remove uma tarefa                           |
| PUT    | /tasks/:id/toggle | Alterna o status de conclusão de uma tarefa |

### Parâmetros e Respostas

#### Registro de Usuário (POST /user/register)

```json
// Requisição
{
  "username": "joaosilva",
  "email": "joao@exemplo.com",
  "password": "senha123"
}

// Resposta
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "username": "joaosilva",
    "email": "joao@exemplo.com"
  }
}
```

#### Login (POST /user/login)

```json
// Requisição
{
  "email": "joao@exemplo.com",
  "password": "senha123"
}

// Resposta
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "username": "joaosilva",
    "email": "joao@exemplo.com"
  }
}
```

#### Criar Tarefa (POST /tasks)

```json
// Requisição
{
  "title": "Completar relatório",
  "description": "Finalizar o relatório mensal de vendas"
}

// Resposta
{
  "id": "1",
  "title": "Completar relatório",
  "description": "Finalizar o relatório mensal de vendas",
  "completed": false,
  "createdAt": "2023-06-15T10:30:00Z"
}
```

## 🧩 Componentes Frontend

### Páginas Principais

#### Login (/login)

- Formulário de login com email e senha
- Opção para alternar para a página de registro
- Validação de campos
- Notificações de erro/sucesso

#### Registro (/register)

- Formulário de registro com nome de usuário, email e senha
- Validação de campos
- Redirecionamento para tarefas após registro bem-sucedido

#### Tarefas (/tasks)

- Lista de tarefas do usuário
- Formulário para adicionar novas tarefas
- Opções para editar, excluir e marcar tarefas como concluídas
- Indicadores visuais de status (emojis)
- Resumo de progresso de conclusão

#### Performance (/performance)

- Estatísticas de conclusão de tarefas
- Gráficos de progresso
- Visão geral de tarefas recentes

### Componentes Reutilizáveis

#### Toast Notifications

Sistema de notificações que exibe mensagens temporárias para:

- Sucesso (verde)
- Erro (vermelho)
- Alerta (amarelo)
- Informação (azul)

#### Undo Delete Banner

Banner que aparece após excluir uma tarefa, permitindo desfazer a exclusão por 5 segundos.

## 🌐 Sistema de Internacionalização

A aplicação suporta os idiomas português e inglês, utilizando o hook personalizado `useLanguage` para gerenciar as traduções.

### Como funciona

1. O hook `useLanguage` mantém o idioma atual no localStorage
2. Todas as strings da UI são carregadas de um objeto de traduções
3. O componente `LanguageProvider` disponibiliza o idioma e funções de tradução para toda a aplicação
4. Os usuários podem alternar entre idiomas com o botão de tradução

### Adicionar novas traduções

Para adicionar novas strings, basta adicionar entradas ao objeto `translations` no arquivo `useLanguage.ts`:

```typescript
const translations = {
  newKey: {
    pt: "Texto em português",
    en: "Text in english",
  },
};
```

## 🔔 Sistema de Notificações

A aplicação utiliza um sistema de notificações "toast" para feedback do usuário.

### Tipos de notificação

- **Success**: Confirmações de ações bem-sucedidas
- **Error**: Mensagens de erro
- **Warning**: Alertas sobre potenciais problemas
- **Info**: Informações gerais

### Uso

```typescript
showToast("success", "Tarefa adicionada com sucesso");
showToast("error", "Falha ao adicionar tarefa");
showToast("warning", "Sua sessão expirará em breve");
showToast("info", "Você pode excluir uma tarefa arrastando-a para a esquerda");
```

## 🎨 Temas

A aplicação suporta temas claro e escuro, gerenciados pelo hook `useTheme`.

### Recursos

- Alternância entre temas claro/escuro
- Persistência da preferência no localStorage
- Transições suaves entre temas
- Design adaptado para ambos os temas

## 🔒 Segurança

### Autenticação

- Autenticação baseada em JWT
- Tokens armazenados no localStorage
- Rotas protegidas no backend e frontend
- Senhas criptografadas com bcrypt

### Boas práticas

- Validação de dados no backend e frontend
- Protection contra CSRF e XSS
- Autenticação de endpoints com middleware JWT

## 📱 Desenvolvimento Mobile

A interface foi projetada para funcionar em dispositivos móveis, com várias otimizações:

### Adaptações para Mobile

- Layout responsivo com TailwindCSS
- Menu de ações compacto para telas pequenas

### Como acessar no dispositivo móvel

Para acessar a aplicação em um dispositivo móvel conectado à mesma rede:

1. Configure a variável de ambiente `VITE_API_URL` para apontar para o IP da sua máquina na rede local
2. Inicie o frontend com o parâmetro --host:

```bash
npm run dev -- --host
```

3. Acesse a URL fornecida pelo terminal em seu dispositivo móvel

