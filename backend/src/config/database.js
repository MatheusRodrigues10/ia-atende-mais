const mongoose = require('mongoose');

const { MONGO_URI, MONGO_MAX_POOL_SIZE, MONGO_TIMEOUT } = process.env;

if (!MONGO_URI) {
  throw new Error('A variável de ambiente MONGO_URI não está configurada.');
}

let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    mongoose.set('strictQuery', false);
    cached.promise = mongoose
      .connect(MONGO_URI, {
        maxPoolSize: parseInt(MONGO_MAX_POOL_SIZE || '5', 10),
        serverSelectionTimeoutMS: parseInt(MONGO_TIMEOUT || '5000', 10)
      })
      .then((mongooseInstance) => {
        console.log('MongoDB conectado com sucesso');
        return mongooseInstance.connection;
      })
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectToDatabase;

