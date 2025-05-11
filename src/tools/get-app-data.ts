import { z } from 'zod';
import { catchErrors, McpError } from '../utils/error-handling.js';
import { initJazzClient, loadCoValueSchema } from '../jazz/jazz-client.js';
import path from 'path';
import fs from 'fs/promises';

/**
 * Input schema for getAppData tool
 */
export const getAppDataInputSchema = z.object({
  appPath: z.string().describe('Path to the Jazz app'),
  schemaName: z.string().describe('Name of the CoValue schema to use'),
  coValueId: z.string().optional().describe('ID of the CoValue to get, if known'),
  query: z.string().optional().describe('Query to filter CoValues by'),
});

/**
 * Output schema for getAppData tool
 */
export const getAppDataOutputSchema = z.object({
  data: z.unknown().describe('The data from the Jazz app'),
  schemaInfo: z.object({
    name: z.string(),
    properties: z.record(z.string()),
  }).describe('Information about the schema used'),
});

/**
 * Get data from a Jazz app
 */
export const getAppData = catchErrors(async (input: z.infer<typeof getAppDataInputSchema>) => {
  const { appPath, schemaName, coValueId, query } = input;
  
  try {
    // Check if app exists
    await fs.access(appPath);
    
    // Find schema file
    const schemaPath = await findSchemaFile(appPath, schemaName);
    if (!schemaPath) {
      throw new McpError(`Schema ${schemaName} not found in app`, 404);
    }
    
    // Load schema
    const schema = await loadCoValueSchema(schemaPath);
    if (!schema) {
      throw new McpError(`Failed to load schema ${schemaName}`, 500);
    }
    
    // Initialize Jazz client
    const { jazz } = await initJazzClient();
    
    // Get data based on input
    let data: unknown;
    
    if (coValueId) {
      // Get specific CoValue by ID
      const coValue = await jazz.get(schema, coValueId);
      if (!coValue) {
        throw new McpError(`CoValue with ID ${coValueId} not found`, 404);
      }
      data = coValue.toJSON();
    } else if (query) {
      // Query CoValues - in a real implementation, this would be more sophisticated
      // For now, we'll just get all and do a basic filter
      const coValues = await jazz.list(schema);
      data = coValues
        .map(cv => cv.toJSON())
        .filter(item => {
          // Basic string match on any field
          return Object.values(item).some(
            value => typeof value === 'string' && value.includes(query)
          );
        });
    } else {
      // Get all CoValues of this type
      const coValues = await jazz.list(schema);
      data = coValues.map(cv => cv.toJSON());
    }
    
    // Extract schema info
    const schemaInfo = {
      name: schemaName,
      properties: extractSchemaProperties(schema),
    };
    
    return {
      data,
      schemaInfo,
    };
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(`Failed to get Jazz app data: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
  }
});

/**
 * Find a schema file in the app directory
 */
async function findSchemaFile(appPath: string, schemaName: string): Promise<string | null> {
  const possibleLocations = [
    path.join(appPath, 'src', 'schemas', `${schemaName}.ts`),
    path.join(appPath, 'src', 'models', `${schemaName}.ts`),
    path.join(appPath, 'src', `${schemaName}.ts`),
  ];
  
  for (const location of possibleLocations) {
    try {
      await fs.access(location);
      return location;
    } catch {
      // File not found, try next location
    }
  }
  
  return null;
}

/**
 * Extract properties from a schema
 */
function extractSchemaProperties(schema: any): Record<string, string> {
  // This is a simplified version - in a real implementation,
  // you would need to examine the schema structure properly
  if (schema.properties) {
    return Object.keys(schema.properties).reduce((acc, key) => {
      acc[key] = typeof schema.properties[key];
      return acc;
    }, {} as Record<string, string>);
  }
  
  return {};
}
