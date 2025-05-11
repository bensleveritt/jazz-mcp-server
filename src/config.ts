import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface ServerConfig {
  port: number;
  host: string;
  isDevelopment: boolean;
  jazzStoragePath: string;
  jazzWsPort: number;
  auth: {
    enabled: boolean;
    apiKey?: string;
  };
}

export const serverConfig: ServerConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || 'localhost',
  isDevelopment: process.env.NODE_ENV !== 'production',
  jazzStoragePath: process.env.JAZZ_STORAGE_PATH || path.join(__dirname, '../data/jazz-storage.sqlite'),
  jazzWsPort: parseInt(process.env.JAZZ_WS_PORT || '3001', 10),
  auth: {
    enabled: process.env.AUTH_ENABLED === 'true',
    apiKey: process.env.AUTH_API_KEY,
  },
};

// Validate config
if (serverConfig.auth.enabled && !serverConfig.auth.apiKey) {
  console.warn('Warning: Auth is enabled but no API key is set. This may cause authentication to fail.');
}
