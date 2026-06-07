require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const createApp = require("./app");
const connectDB = require("./config/database");
const socketAuth = require("./socket/socketAuth");
const setupSocketHandlers = require("./socket/socketHandlers");

// Connect to database
connectDB();

// Create Express app
const app = createApp();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Socket.io authentication middleware
io.use(socketAuth);

// Setup socket handlers
setupSocketHandlers(io);

// Make io accessible to routes if needed
app.set("io", io);

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            
║     GROOVLY BACKEND - Collaborative Music Platform         
║                                                            
║     Server running on port ${PORT}                            
║     Environment: ${process.env.NODE_ENV || "development"}                               
║     Socket.io: Enabled                                     
║                                                            
║     API Docs: ${baseUrl}/                       
║     Health: ${baseUrl}/api/health               
║                                                            
╚════════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

module.exports = server;
