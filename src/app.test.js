const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./app');
const { MongoMemoryServer } = require('mongodb-memory-server');
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});


describe("API de Posts", () => {
  let postId;

  it("Deve criar um novo post", async () => {
    const res = await request(app)
      .post('/posts')
      .send({
        titulo: "Post de teste",
        conteudo: "Conteúdo de teste",
        autor: "Autor de teste"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id');
    postId = res.body._id;
  });

  it("Deve retornar todos os posts", async () => {
    const res = await request(app).get('/posts');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("Deve buscar um post pelo ID", async () => {
    const res = await request(app).get(`/posts/${postId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', postId);
  });

  it("Deve buscar posts com filtro", async () => {
    const res = await request(app).get('/posts/search').query({ titulo: "teste" });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("Deve atualizar um post", async () => {
    const res = await request(app)
      .put(`/posts/${postId}`)
      .send({ titulo: "Post atualizado" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('titulo', "Post atualizado");
  });

  it("Deve deletar um post", async () => {
    const res = await request(app).delete(`/posts/${postId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', postId);
  });
});
