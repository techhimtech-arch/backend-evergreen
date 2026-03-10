console.log("🚀 Starting Server...");

const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/database');

async function startServer() {
  try {

    console.log("🔄 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ MongoDB connected");
console.log("PORT from config:", config.PORT);

const PORT = config.port || 5000;
   

    app.listen(PORT, () => {
      console.log("=================================");
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${config.env}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/health`);
      console.log(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
      console.log("=================================");
    });

  } catch (error) {
    console.error("❌ Server startup failed:");
    console.error(error);
    process.exit(1);
  }
}

startServer();