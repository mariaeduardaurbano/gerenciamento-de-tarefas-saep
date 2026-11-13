CREATE DATABASE gerenciamento tarefas;

USE gerenciamento_tarefas;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE tarefas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    setor VARCHAR(100) NOT NULL,
    prioridade ENUM('baixa', 'media', 'alta') NOT NULL,
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('a fazer', 'fazendo', 'pronto')
        NOT NULL DEFAULT 'a fazer',

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
);

CREATE VIEW vw_tarefas AS
SELECT
    tarefas.id,
    usuarios.nome AS usuario,
    usuarios.email,
    tarefas.descricao,
    tarefas.setor,
    tarefas.prioridade,
    tarefas.data_cadastro,
    tarefas.status
FROM tarefas
INNER JOIN usuarios
    ON tarefas.usuario_id = usuarios.id;

SELECT * FROM vw_tarefas;

SELECT * FROM vw_tarefas
WHERE status = 'a fazer';

SELECT * FROM vw_tarefas
WHERE status = 'fazendo';

SELECT * FROM vw_tarefas
WHERE status = 'pronto';
