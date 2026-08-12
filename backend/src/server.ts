import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import http from 'node:http';
import { setupSocket } from './socket.js';

async function startServer() {
  try {
    // 1. Connect to Database first
    await connectDatabase();

    // 2. Initialize Express App
    const app = createApp();
    
    // 3. Create HTTP Server (useful for future Socket.IO integration)
    const server = http.createServer(app);

    // Initialize Socket.IO
    setupSocket(server);

    // 4. Start listening
    server.listen(env.PORT, () => {
      console.log(`[server] Link2 Backend running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      console.log(`[server] API URL: http://localhost:${env.PORT}/api`);
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('[server] Shutting down gracefully...');
      server.close(() => {
        console.log('[server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    
  } catch (error) {
    console.error('[server] Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
