# Gerenciamento de Tarefas

Sistema web desenvolvido para o gerenciamento de tarefas, permitindo cadastrar usuários, registrar tarefas e acompanhar seus respectivos status.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Node.js
- Express
- Prisma ORM
- MariaDB

## Funcionalidades

- Cadastro de usuários.
- Cadastro de tarefas vinculadas aos usuários.
- Listagem de tarefas organizadas por status:
  - A Fazer
  - Fazendo
  - Pronto
- Edição de tarefas cadastradas.
- Exclusão de tarefas com confirmação.
- Atualização do status das tarefas.

## Estrutura do projeto

```text
gerenciamento-tarefas-saep/
│
├── index.html
├── cadastro-usuarios.html
├── cadastro-tarefas.html
├── style.css
├── script.js
│
└── backend/
    ├── prisma/
    │   └── schema.prisma
    ├── server.js
    ├── .env
    └── package.json
```

## Como executar o projeto

**1.** Certifique-se de que o MariaDB esteja em execução e que o banco de dados `gerenciamento_tarefas` esteja criado.

**2.** Configure a variável `DATABASE_URL` no arquivo `.env`, de acordo com as configurações do seu banco de dados.

**3.** Abra o terminal na pasta `backend`:

```bash
cd backend
```

**4.** Instale as dependências:

```bash
npm install
```

**5.** Gere o Prisma Client:

```bash
npx prisma generate
```

**6.** Inicie o servidor:

```bash
node server.js
```

**7.** Acesse o sistema pelo navegador:

```text
http://localhost:3000
```

## Banco de dados

O sistema utiliza o MariaDB para armazenar os dados dos usuários e das tarefas.

As tarefas possuem relacionamento com os usuários por meio da chave estrangeira `usuario_id`.

## Desenvolvido por

**Maria Eduarda Urbano**

Projeto desenvolvido como atividade prática do curso Técnico em Desenvolvimento de Sistemas.
