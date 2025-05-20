require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const SALT_ROUNDS = 10;
const app = express();

app.use(express.json());
app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Models
const Post = mongoose.model('Post', {
  titulo: String,
  conteudo: String,
  autor: String
});

const Aluno = mongoose.model('Aluno', {
  nome: String,
  curso: String,
  matricula: String
});

const Professor = mongoose.model('Professor', {
  nome: String,
  materia: String,
  login: String,
  senha: String
});

/* ROTAS POSTS */

app.get("/posts", async (req, res) => {
  const posts = await Post.find();
  res.status(200).send(posts);
});

app.get("/posts/search", async (req, res) => {
  const { titulo, conteudo } = req.query;
  const filter = {};
  if (titulo) filter.titulo = new RegExp(titulo, 'i');
  if (conteudo) filter.conteudo = new RegExp(conteudo, 'i');
  const posts = await Post.find(filter);
  res.status(200).json(posts);
});

app.get("/posts/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).send({ error: 'Post não encontrado' });
  res.status(200).send(post);
});

app.post("/posts", async (req, res) => {
  const post = new Post(req.body);
  await post.save();
  res.status(201).send(post);
});

app.put("/posts/:id", async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!post) return res.status(404).send({ error: 'Post não encontrado' });
  res.status(200).send(post);
});

app.delete("/posts/:id", async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) return res.status(404).send({ error: 'Post não encontrado' });
  res.status(200).send({ message: 'Post deletado com sucesso' });
});

/* ROTAS ALUNOS */

app.post("/alunos", async (req, res) => {
  try {
    const { nome, curso, matricula } = req.body;
    const aluno = new Aluno({ nome, curso, matricula });
    await aluno.save();
    res.status(201).send(aluno);
  } catch (err) {
    res.status(400).send({ error: 'Erro ao criar aluno', details: err });
  }
});

app.put("/alunos/:id", async (req, res) => {
  try {
    const aluno = await Aluno.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!aluno) return res.status(404).send({ error: 'Aluno não encontrado' });
    res.status(200).send(aluno);
  } catch (err) {
    res.status(400).send({ error: 'Erro ao atualizar aluno', details: err });
  }
});

app.delete("/alunos/:id", async (req, res) => {
  try {
    const aluno = await Aluno.findByIdAndDelete(req.params.id);
    if (!aluno) return res.status(404).send({ error: 'Aluno não encontrado' });
    res.status(200).send({ message: 'Aluno deletado com sucesso' });
  } catch (err) {
    res.status(400).send({ error: 'Erro ao deletar aluno', details: err });
  }
});

app.get("/alunos", async (req, res) => {
  const { nome } = req.query;
  const filter = {};
  if (nome) filter.nome = new RegExp(nome, 'i');
  const alunos = await Aluno.find(filter);
  res.status(200).send(alunos);
});

/* ROTAS PROFESSORES */

app.post("/professores", async (req, res) => {
  try {
    const { nome, materia, login, senha } = req.body;
    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
    const professor = new Professor({ nome, materia, login, senha: senhaHash });
    await professor.save();
    const { senha: _, ...professorSemSenha } = professor.toObject();
    res.status(201).send(professorSemSenha);
  } catch (err) {
    res.status(400).send({ error: 'Erro ao criar professor', details: err });
  }
});

app.put("/professores/:id", async (req, res) => {
  try {
    const professor = await Professor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!professor) return res.status(404).send({ error: 'Professor não encontrado' });
    const { senha, ...professorSemSenha } = professor.toObject();
    res.status(200).send(professorSemSenha);
  } catch (err) {
    res.status(400).send({ error: 'Erro ao atualizar professor', details: err });
  }
});

app.delete("/professores/:id", async (req, res) => {
  try {
    const professor = await Professor.findByIdAndDelete(req.params.id);
    if (!professor) return res.status(404).send({ error: 'Professor não encontrado' });
    res.status(200).send({ message: 'Professor deletado com sucesso' });
  } catch (err) {
    res.status(400).send({ error: 'Erro ao deletar professor', details: err });
  }
});

app.get("/professores", async (req, res) => {
  const { nome } = req.query;
  const filter = {};
  if (nome) filter.nome = new RegExp(nome, 'i');
  const professores = await Professor.find(filter);
  const professoresSemSenha = professores.map(({ senha, ...rest }) => rest);
  res.status(200).send(professoresSemSenha);
});

/* AUTENTICAÇÃO DE PROFESSOR */

app.post("/professores/auth", async (req, res) => {
  const { login, senha } = req.body;

  if (!login || !senha) {
    return res.status(400).send({ error: 'Login e senha são obrigatórios.' });
  }

  try {
    const professor = await Professor.findOne({ login });
    if (!professor) {
      return res.status(401).send({ error: 'Credenciais inválidas' });
    }

    const senhaValida = await bcrypt.compare(senha, professor.senha);
    if (!senhaValida) {
      return res.status(401).send({ error: 'Credenciais inválidas' });
    }

    const { senha: _, ...professorSemSenha } = professor.toObject();
    res.status(200).send({ message: 'Autenticação de professor bem-sucedida', professor: professorSemSenha });
  } catch (err) {
    res.status(500).send({ error: 'Erro no servidor', details: err });
  }
});

module.exports = app;
