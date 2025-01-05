const express = require('express')
const mongoose = require('mongoose');

const app = express()
app.use(express.json())
const port = 3000


const Post = mongoose.model('Post', {
  titulo: String,
  conteudo: String,
  autor: String
});


app.get("/posts", async (req, res) => {
  const post = await Post.find()
  return res.send(post)
})


app.get('/posts/search', async (req, res) => {
  const { titulo, conteudo } = req.query; // Captura os parâmetros de busca
  // Monta o filtro dinamicamente com base nos parâmetros recebidos
  const filter = {};
  if (titulo) filter.titulo = new RegExp(titulo, 'i'); // Busca por título (case insensitive)
  if (conteudo) filter.conteudo = new RegExp(conteudo, 'i'); // Busca por descrição (case insensitive)

  // Consulta no banco de dados
  const conteudosEncontrados = await Post.find(filter);
  res.status(200).json(conteudosEncontrados); // Retorna os filmes encontrados
});


app.get("/posts/:id", async (req, res) => {
  const post = await Post.findById(req.params.id)
  return res.send(post)
})



app.delete("/posts/:id", async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id)
  return res.send(post)
})

app.put("/posts/:id", async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, {
    titulo: req.body.titulo,
    conteudo: req.body.conteudo,
    autor: req.body.autor
  },{
    new: true
  })
  return res.send(post)
})

app.post("/posts", async (req, res) => {
  const post = new Post({
    titulo: req.body.titulo,
    conteudo: req.body.conteudo,
    autor: req.body.autor
  })
  await post.save()
  res.send(post)
})



app.listen(port, () => {
  mongoose.connect('mongodb+srv://leandrosxe:bg_khJG8N4rPhcL@blog-api.sa8j0.mongodb.net/?retryWrites=true&w=majority&appName=blog-api')
  console.log(`Aplicação rodando na porta ${port}`)
})