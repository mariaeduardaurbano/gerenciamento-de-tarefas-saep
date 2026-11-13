// ==========================================
// CADASTRO DE USUÁRIOS
// ==========================================

const formularioUsuario = document.getElementById("formCadastro");

if (formularioUsuario) {
  formularioUsuario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const mensagem = document.getElementById("mensagem");
    const botao = document.getElementById("botaoCadastrar");

    mensagem.textContent = "";

    botao.disabled = true;

    try {
      const resposta = await fetch("/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, email }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem);
      }

      mensagem.textContent = dados.mensagem;
      mensagem.className = "sucesso";

      formularioUsuario.reset();
    } catch (erro) {
      mensagem.textContent = erro.message;
      mensagem.className = "erro";
    } finally {
      botao.disabled = false;
    }
  });
}

// ==========================================
// CADASTRO E EDIÇÃO DE TAREFAS
// ==========================================

const formularioTarefa = document.getElementById("formTarefa");

if (formularioTarefa) {
  const campoUsuario = document.getElementById("usuario");
  const mensagem = document.getElementById("mensagem");
  const botao = document.getElementById("botaoCadastrar");

  const parametros = new URLSearchParams(window.location.search);
  const idTarefa = parametros.get("id");

  // Carregar usuários
  async function carregarUsuarios() {
    const resposta = await fetch("/api/usuarios");

    if (!resposta.ok) {
      throw new Error("Erro ao carregar usuários.");
    }

    const usuarios = await resposta.json();

    usuarios.forEach((usuario) => {
      const opcao = document.createElement("option");

      opcao.value = usuario.id;
      opcao.textContent = usuario.nome;

      campoUsuario.appendChild(opcao);
    });
  }

  // Carregar tarefa para edição
  async function carregarTarefa() {
    const resposta = await fetch(`/api/tarefas/${idTarefa}`);

    if (!resposta.ok) {
      throw new Error("Erro ao carregar tarefa para edição.");
    }

    const tarefa = await resposta.json();

    document.getElementById("descricao").value = tarefa.descricao;
    document.getElementById("setor").value = tarefa.setor;
    campoUsuario.value = tarefa.usuario_id;
    document.getElementById("prioridade").value = tarefa.prioridade;

    botao.textContent = "Atualizar tarefa";
  }

  async function prepararFormulario() {
    try {
      await carregarUsuarios();

      if (idTarefa) {
        await carregarTarefa();
      }
    } catch (erro) {
      mensagem.textContent = erro.message;
      mensagem.className = "erro";
    }
  }

  prepararFormulario();

  // Enviar cadastro ou atualização
  formularioTarefa.addEventListener("submit", async (event) => {
    event.preventDefault();

    const descricao = document.getElementById("descricao").value;
    const setor = document.getElementById("setor").value;
    const usuario_id = campoUsuario.value;
    const prioridade = document.getElementById("prioridade").value;

    mensagem.textContent = "";

    if (!descricao.trim() || !setor.trim() || !usuario_id || !prioridade) {
      mensagem.textContent = "Preencha todos os campos.";
      mensagem.className = "erro";
      return;
    }

    botao.disabled = true;
    botao.textContent = "Salvando...";

    try {
      const resposta = await fetch(
        idTarefa ? `/api/tarefas/${idTarefa}` : "/api/tarefas",
        {
          method: idTarefa ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            descricao,
            setor,
            usuario_id,
            prioridade,
          }),
        },
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem);
      }

      if (idTarefa) {
        alert("Tarefa atualizada com sucesso!");
        window.location.href = "index.html";
      } else {
        mensagem.textContent = dados.mensagem;
        mensagem.className = "sucesso";
        formularioTarefa.reset();
      }
    } catch (erro) {
      mensagem.textContent = erro.message;
      mensagem.className = "erro";
    } finally {
      botao.disabled = false;
      if (!idTarefa) {
        botao.textContent = "Cadastrar";
      }
    }
  });
}

// ==========================================
// GERENCIAMENTO DE TAREFAS
// ==========================================

const colunaAFazer = document.getElementById("coluna-a_fazer");

if (colunaAFazer) {
  const mensagem = document.getElementById("mensagem");

  const statusNomes = {
    a_fazer: "A Fazer",
    fazendo: "Fazendo",
    pronto: "Pronto",
  };

  // Criar um elemento HTML com texto seguro
  function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);

    if (classe) {
      elemento.className = classe;
    }

    elemento.textContent = texto;

    return elemento;
  }

  // Criar os cards
  function criarCard(tarefa) {
    const card = criarElemento("article", "card-tarefa");

    const descricao = document.createElement("p");
    const setor = document.createElement("p");
    const prioridade = document.createElement("p");
    const usuario = document.createElement("p");

    descricao.append(
      criarElemento("strong", "", "Descrição: "),
      document.createTextNode(tarefa.descricao),
    );

    setor.append(
      criarElemento("strong", "", "Setor: "),
      document.createTextNode(tarefa.setor),
    );

    prioridade.append(
      criarElemento("strong", "", "Prioridade: "),
      document.createTextNode(
        tarefa.prioridade.charAt(0).toUpperCase() + tarefa.prioridade.slice(1),
      ),
    );

    usuario.append(
      criarElemento("strong", "", "Vinculado a: "),
      document.createTextNode(tarefa.usuarios.nome),
    );

    card.append(descricao, setor, prioridade, usuario);

    // Botões de edição e exclusão
    const acoes = criarElemento("div", "acoes");

    const editar = criarElemento("a", "botao-card", "Editar");
    editar.href = `cadastro-tarefas.html?id=${tarefa.id}`;

    const excluir = criarElemento("button", "botao-card excluir", "Excluir");

    excluir.addEventListener("click", () => excluirTarefa(tarefa.id));

    acoes.append(editar, excluir);

    // Seleção de status
    const controles = criarElemento("div", "controles-status");

    const select = document.createElement("select");

    Object.entries(statusNomes).forEach(([valor, nome]) => {
      const opcao = document.createElement("option");

      opcao.value = valor;
      opcao.textContent = nome;

      if (tarefa.status === valor) {
        opcao.selected = true;
      }

      select.appendChild(opcao);
    });

    const atualizar = criarElemento("button", "botao-card", "Alterar Status");

    atualizar.addEventListener("click", () => {
      alterarStatus(tarefa.id, select.value);
    });

    controles.append(select, atualizar);

    card.append(acoes, controles);

    return card;
  }

  // Buscar tarefas e separar por status
  async function carregarTarefas() {
    mensagem.textContent = "";

    try {
      const resposta = await fetch("/api/tarefas");

      if (!resposta.ok) {
        throw new Error("Erro ao carregar tarefas.");
      }

      const tarefas = await resposta.json();

      const colunas = {
        a_fazer: document.getElementById("coluna-a_fazer"),
        fazendo: document.getElementById("coluna-fazendo"),
        pronto: document.getElementById("coluna-pronto"),
      };

      Object.values(colunas).forEach((coluna) => {
        coluna.innerHTML = "";
      });

      tarefas.forEach((tarefa) => {
        if (colunas[tarefa.status]) {
          colunas[tarefa.status].appendChild(criarCard(tarefa));
        }
      });

      Object.entries(colunas).forEach(([status, coluna]) => {
        if (coluna.children.length === 0) {
          coluna.appendChild(
            criarElemento("p", "sem-tarefas", "Nenhuma tarefa nesta coluna."),
          );
        }
      });
    } catch (erro) {
      mensagem.textContent = erro.message;
      mensagem.className = "erro";
    }
  }

  // Alterar status
  async function alterarStatus(id, status) {
    try {
      const resposta = await fetch(`/api/tarefas/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem);
      }

      mensagem.textContent = dados.mensagem;
      mensagem.className = "sucesso";

      await carregarTarefas();
    } catch (erro) {
      mensagem.textContent = erro.message;
      mensagem.className = "erro";
    }
  }

  // Excluir tarefa
  async function excluirTarefa(id) {
    const confirmar = confirm("Tem certeza de que deseja excluir esta tarefa?");

    if (!confirmar) {
      return;
    }

    try {
      const resposta = await fetch(`/api/tarefas/${id}`, {
        method: "DELETE",
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.mensagem);
      }

      mensagem.textContent = dados.mensagem;
      mensagem.className = "sucesso";

      await carregarTarefas();
    } catch (erro) {
      mensagem.textContent = erro.message;
      mensagem.className = "erro";
    }
  }

  carregarTarefas();
}
