const app = require('./app');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3000;

//const PORT = 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Conexão com o MongoDB estabelecida");
    app.listen(PORT, () => console.log(`Aplicação rodando na porta ${PORT}`));
  })
  .catch(err => {
    console.error("Erro ao conectar ao MongoDB", err);
  });
