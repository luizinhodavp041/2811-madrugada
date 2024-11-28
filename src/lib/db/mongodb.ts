import mongoose from "mongoose";

// Interface para definir a estrutura do cache
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Declare o tipo global
declare global {
  var mongooseCache: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

// Inicializa o cache
if (!global.mongooseCache) {
  global.mongooseCache = {
    conn: null,
    promise: null,
  };
}

async function connectDB() {
  try {
    // Se já existe uma conexão, retorna ela
    if (global.mongooseCache?.conn) {
      console.log("Usando conexão existente com MongoDB");
      return global.mongooseCache.conn;
    }

    // Opções de conexão
    const opts = {
      bufferCommands: false,
      autoIndex: true, // Importante para garantir que os índices sejam criados
      maxPoolSize: 10, // Limite máximo de conexões simultâneas
    };

    // Se não há uma promessa de conexão, cria uma nova
    if (!global.mongooseCache?.promise) {
      console.log("Iniciando nova conexão com MongoDB...");
      global.mongooseCache!.promise = mongoose.connect(MONGODB_URI, opts);
    }

    try {
      // Aguarda a conexão e armazena no cache
      global.mongooseCache!.conn = await global.mongooseCache!.promise;
      console.log("Conexão com MongoDB estabelecida com sucesso");

      // Força o Mongoose a tentar reconectar se perder a conexão
      mongoose.connection.on("disconnected", () => {
        console.log("MongoDB desconectado. Tentando reconectar...");
        global.mongooseCache!.conn = null;
        global.mongooseCache!.promise = null;
      });

      // Log de reconexão bem-sucedida
      mongoose.connection.on("reconnected", () => {
        console.log("MongoDB reconectado com sucesso");
      });

      return global.mongooseCache!.conn;
    } catch (e) {
      // Se houver erro, limpa a promessa para permitir nova tentativa
      global.mongooseCache!.promise = null;
      throw e;
    }
  } catch (error) {
    console.error("Erro ao conectar com MongoDB:", error);
    throw error;
  }
}

export default connectDB;
