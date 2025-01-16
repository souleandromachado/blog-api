require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const Post = mongoose.model('Post', {
  titulo: String,
  conteudo: String,
  autor: String
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

module.exports = app;