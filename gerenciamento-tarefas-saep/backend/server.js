const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Carrega os arquivos do frontend que estão na pasta principal
app.use(express.static(path.join(__dirname, "..")));

// Rota para cadastrar usuários
app.post("/api/usuarios", async (req, res) => {
  try {
    const { nome, email } = req.body;

    if (!nome || !email) {
      return res.status(400).json({
        mensagem: "Preencha todos os campos.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        mensagem: "Informe um e-mail válido.",
      });
    }

    const usuario = await prisma.usuarios.create({
      data: {
        nome,
        email,
      },
    });

    return res.status(201).json({
      mensagem: "Cadastro concluído com sucesso!",
      usuario,
    });
  } catch (erro) {
    if (erro.code === "P2002") {
      return res.status(409).json({
        mensagem: "Este e-mail já está cadastrado.",
      });
    }

    console.error("Erro ao cadastrar usuário:", erro);

    return res.status(500).json({
      mensagem: "Erro ao realizar o cadastro.",
    });
  }
});

// Buscar usuários cadastrados
app.get("/api/usuarios", async (req, res) => {
  try {
    const usuarios = await prisma.usuarios.findMany({
      select: {
        id: true,
        nome: true,
      },
      orderBy: {
        nome: "asc",
      },
    });

    res.status(200).json(usuarios);
  } catch (erro) {
    console.error("Erro ao buscar usuários:", erro);

    res.status(500).json({
      mensagem: "Erro ao buscar usuários.",
    });
  }
});

// Cadastrar tarefas
app.post("/api/tarefas", async (req, res) => {
  try {
    const { descricao, setor, usuario_id, prioridade } = req.body;

    if (!descricao || !setor || !usuario_id || !prioridade) {
      return res.status(400).json({
        mensagem: "Preencha todos os campos.",
      });
    }

    const idUsuario = Number(usuario_id);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      return res.status(400).json({
        mensagem: "Selecione um usuário válido.",
      });
    }

    if (!["baixa", "media", "alta"].includes(prioridade)) {
      return res.status(400).json({
        mensagem: "Selecione uma prioridade válida.",
      });
    }

    const tarefa = await prisma.tarefas.create({
      data: {
        descricao,
        setor,
        usuario_id: idUsuario,
        prioridade,
      },
    });

    return res.status(201).json({
      mensagem: "Cadastro concluído com sucesso!",
      tarefa,
    });
  } catch (erro) {
    console.error("Erro ao cadastrar tarefa:", erro);

    return res.status(500).json({
      mensagem: "Erro ao realizar o cadastro da tarefa.",
    });
  }
});

// ==========================================
// LISTAR TODAS AS TAREFAS
// ==========================================

app.get("/api/tarefas", async (req, res) => {
  try {
    const tarefas = await prisma.tarefas.findMany({
      include: {
        usuarios: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    res.json(tarefas);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({
      mensagem: "Erro ao buscar tarefas.",
    });
  }
});

// ==========================================
// BUSCAR UMA TAREFA PELO ID
// ==========================================

app.get("/api/tarefas/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: "ID inválido.",
      });
    }

    const tarefa = await prisma.tarefas.findUnique({
      where: { id },
      include: {
        usuarios: true,
      },
    });

    if (!tarefa) {
      return res.status(404).json({
        mensagem: "Tarefa não encontrada.",
      });
    }

    res.json(tarefa);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({
      mensagem: "Erro ao buscar tarefa.",
    });
  }
});

// ==========================================
// EDITAR UMA TAREFA
// ==========================================

app.put("/api/tarefas/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { descricao, setor, usuario_id, prioridade } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: "ID inválido.",
      });
    }

    if (!descricao?.trim() || !setor?.trim() || !usuario_id || !prioridade) {
      return res.status(400).json({
        mensagem: "Preencha todos os campos.",
      });
    }

    const idUsuario = Number(usuario_id);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      return res.status(400).json({
        mensagem: "Selecione um usuário válido.",
      });
    }

    if (!["baixa", "media", "alta"].includes(prioridade)) {
      return res.status(400).json({
        mensagem: "Prioridade inválida.",
      });
    }

    const tarefa = await prisma.tarefas.update({
      where: { id },
      data: {
        descricao,
        setor,
        usuario_id: idUsuario,
        prioridade,
      },
    });

    res.json({
      mensagem: "Tarefa atualizada com sucesso!",
      tarefa,
    });
  } catch (erro) {
    console.error(erro);

    if (erro.code === "P2025") {
      return res.status(404).json({
        mensagem: "Tarefa não encontrada.",
      });
    }

    res.status(500).json({
      mensagem: "Erro ao atualizar tarefa.",
    });
  }
});

// ==========================================
// ALTERAR STATUS DA TAREFA
// ==========================================

app.patch("/api/tarefas/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const statusPermitidos = ["a_fazer", "fazendo", "pronto"];

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: "ID inválido.",
      });
    }

    if (!statusPermitidos.includes(status)) {
      return res.status(400).json({
        mensagem: "Status inválido.",
      });
    }

    const tarefa = await prisma.tarefas.update({
      where: { id },
      data: { status },
    });

    res.json({
      mensagem: "Status atualizado com sucesso!",
      tarefa,
    });
  } catch (erro) {
    console.error(erro);

    res.status(500).json({
      mensagem: "Erro ao atualizar status.",
    });
  }
});

// ==========================================
// EXCLUIR TAREFA
// ==========================================

app.delete("/api/tarefas/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: "ID inválido.",
      });
    }

    await prisma.tarefas.delete({
      where: { id },
    });

    res.json({
      mensagem: "Tarefa excluída com sucesso!",
    });
  } catch (erro) {
    console.error(erro);

    if (erro.code === "P2025") {
      return res.status(404).json({
        mensagem: "Tarefa não encontrada.",
      });
    }

    res.status(500).json({
      mensagem: "Erro ao excluir tarefa.",
    });
  }
});

const PORTA = 3000;

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
