import { z } from 'zod';
import { catchErrors, McpError } from '../utils/error-handling.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Input schema for listApps tool
 */
export const listAppsInputSchema = z.object({
  path: z.string().optional().describe('Optional path to look for Jazz apps'),
});

/**
 * Output schema for listApps tool
 */
export const listAppsOutputSchema = z.object({
  apps: z.array(
    z.object({
      name: z.string().describe('Name of the Jazz app'),
      path: z.string().describe('Path to the Jazz app'),
      hasPackageJson: z.boolean().describe('Whether the app has a package.json file'),
    })
  ),
});

/**
 * List Jazz apps in a directory
 */
export const listApps = catchErrors(async (input: z.infer<typeof listAppsInputSchema>) => {
  const searchPath = input.path || process.cwd();
  
  try {
    // Check if directory exists
    await fs.access(searchPath);
    
    // List directories
    const entries = await fs.readdir(searchPath, { withFileTypes: true });
    const directories = entries.filter(entry => entry.isDirectory());
    
    // Check each directory for Jazz apps
    const apps = await Promise.all(
      directories.map(async (dir) => {
        const dirPath = path.join(searchPath, dir.name);
        try {
          // Check if package.json exists
          const packageJsonPath = path.join(dirPath, 'package.json');
          const hasPackageJson = await fs.access(packageJsonPath)
            .then(() => true)
            .catch(() => false);
          
          // If it has package.json, check if it uses Jazz
          let isJazzApp = false;
          if (hasPackageJson) {
            const packageJson = JSON.parse(
              await fs.readFile(packageJsonPath, 'utf-8')
            );
            
            // Check if it uses any Jazz packages
            isJazzApp = Object.keys({
              ...packageJson.dependencies,
              ...packageJson.devDependencies,
            }).some(dep => 
              dep.startsWith('jazz-') || 
              dep === 'cojson' || 
              dep === 'cojson-storage'
            );
          }
          
          if (isJazzApp) {
            return {
              name: dir.name,
              path: dirPath,
              hasPackageJson,
            };
          }
          return null;
        } catch (error) {
          // Skip directories with errors
          return null;
        }
      })
    );
    
    // Filter out nulls and return
    return {
      apps: apps.filter(Boolean),
    };
  } catch (error) {
    throw new McpError(`Failed to list Jazz apps: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
  }
});
