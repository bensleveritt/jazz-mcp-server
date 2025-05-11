import { Request, Response, NextFunction } from 'express';
import { serverConfig } from '../config.js';

/**
 * Middleware to authenticate API requests using the configured API key
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Skip auth if not enabled
  if (!serverConfig.auth.enabled) {
    return next();
  }

  const apiKey = req.headers['x-api-key'];

  // If no API key is provided, return 401
  if (!apiKey) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'Please provide an API key using the X-API-Key header',
    });
    return;
  }

  // If API key doesn't match, return 403
  if (apiKey !== serverConfig.auth.apiKey) {
    res.status(403).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid',
    });
    return;
  }

  // API key is valid, continue
  next();
}
