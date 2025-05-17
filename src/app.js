require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const Post = mongoose.model('Post', {
  titulo: String,
  conteudo: String,
  autor: String
});

const Aluno = mongoose.model('Aluno', {
  nome: String,
  curso: String
});

const Professor = mongoose.model('Professor', {
  nome: String,
  materia: String
});



app.get("/posts", async (req, res) => {
  const posts = await Post.find();
  res.send(posts);
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
  res.send(post);
});

app.post("/posts", async (req, res) => {
  const post = new Post(req.body);
  await post.save();
  res.send(post);
});

app.put("/posts/:id", async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.send(post);
});

app.delete("/posts/:id", async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  res.send(post);
});

/* Area de config de request de alunos */

// Criar novo aluno
app.post("/alunos", async (req, res) => {
  try {
    const aluno = new Aluno(req.body);
    await aluno.save();
    res.status(201).send(aluno);
  } catch (err) {
    res.status(400).send({ error: 'Erro ao criar aluno', details: err });
  }
});

// Editar aluno por ID
app.put("/alunos/:id", async (req, res) => {
  try {
    const aluno = await Aluno.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!aluno) return res.status(404).send({ error: 'Aluno não encontrado' });
    res.send(aluno);
  } catch (err) {
    res.status(400).send({ error: 'Erro ao atualizar aluno', details: err });
  }
});

// Deletar aluno por ID
app.delete("/alunos/:id", async (req, res) => {
  try {
    const aluno = await Aluno.findByIdAndDelete(req.params.id);
    if (!aluno) return res.status(404).send({ error: 'Aluno não encontrado' });
    res.send({ message: 'Aluno deletado com sucesso' });
  } catch (err) {
    res.status(400).send({ error: 'Erro ao deletar aluno', details: err });
  }
});

app.get("/alunos", async (req, res) => {
  const { nome } = req.query;
  const filter = {};
  if (nome) filter.nome = new RegExp(nome, 'i');
  const alunos = await Aluno.find(filter);
  res.send(alunos);
});

/* Area de config de request de professores */

// Criar novo professor
app.post("/professores", async (req, res) => {
  try {
    const professor = new Professor(req.body);
    await professor.save();
    res.status(201).send(professor);
  } catch (err) {
    res.status(400).send({ error: 'Erro ao criar professor', details: err });
  }
});

// Editar professor por ID
app.put("/professores/:id", async (req, res) => {
  try {
    const professor = await Professor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!professor) return res.status(404).send({ error: 'Professor não encontrado' });
    res.send(professor);
  } catch (err) {
    res.status(400).send({ error: 'Erro ao atualizar professor', details: err });
  }
});

// Deletar professor por ID
app.delete("/professores/:id", async (req, res) => {
  try {
    const professor = await Professor.findByIdAndDelete(req.params.id);
    if (!professor) return res.status(404).send({ error: 'Professor não encontrado' });
    res.send({ message: 'Professor deletado com sucesso' });
  } catch (err) {
    res.status(400).send({ error: 'Erro ao deletar professor', details: err });
  }
});

app.get("/professores", async (req, res) => {
  const { professor } = req.query;
  const filter = {};
  if (professor) filter.professor = new RegExp(professor, 'i');
  const professores = await Professor.find(filter);
  res.send(professores);
});

module.exports = app;