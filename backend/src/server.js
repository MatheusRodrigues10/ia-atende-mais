require('dotenv').config();
const app = require('./app');
const connectToDatabase = require('./config/database');

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  connectToDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Erro ao conectar ao MongoDB:', err);
      process.exit(1);
    });
}

module.exports = app;
