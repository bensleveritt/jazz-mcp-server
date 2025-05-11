import { createJazz } from 'jazz-nodejs';
import { SqliteStorage } from 'cojson-storage-sqlite';
import { WebSocketSyncServer } from 'cojson-transport-ws';
import http from 'http';
import { WebSocketServer } from 'ws';
import { serverConfig } from '../config.js';
import path from 'path';
import { mkdirSync } from 'fs';
import { pathToFileURL } from 'url';

/**
 * Creates necessary directories for Jazz storage
 */
function ensureStoragePath() {
  const dirPath = path.dirname(serverConfig.jazzStoragePath);
  mkdirSync(dirPath, { recursive: true });
}

/**
 * Initialize the Jazz client with SQLite storage and WebSocket server
 */
export async function initJazzClient() {
  ensureStoragePath();

  // Initialize SQLite storage for Jazz
  const storage = new SqliteStorage(serverConfig.jazzStoragePath);

  // Create HTTP server for WebSocket
  const httpServer = http.createServer();
  const wsServer = new WebSocketServer({ server: httpServer });

  // Create WebSocket sync server for Jazz
  const syncServer = new WebSocketSyncServer({
    server: wsServer,
    authenticateConnection: () => {
      // In a real application, you would add proper authentication here
      return Promise.resolve({
        sessionId: crypto.randomUUID(),
        name: 'MCP Server',
      });
    },
  });

  // Initialize Jazz with storage and sync
  const jazz = createJazz({
    storage,
    sync: [syncServer],
  });

  // Start the WebSocket server
  httpServer.listen(serverConfig.jazzWsPort, () => {
    console.log(`Jazz WebSocket server running at ws://${serverConfig.host}:${serverConfig.jazzWsPort}`);
  });

  return {
    jazz,
    storage,
    syncServer,
    httpServer,
    wsServer,
  };
}

/**
 * Load a coValue schema from a file path
 */
export async function loadCoValueSchema(schemaPath: string) {
  try {
    const fileUrl = pathToFileURL(schemaPath).href;
    const module = await import(fileUrl);
    return module.default || module;
  } catch (error) {
    console.error(`Error loading CoValue schema from ${schemaPath}:`, error);
    throw new Error(`Failed to load CoValue schema from ${schemaPath}`);
  }
}
