/**
 * Represents a typed error with a specific status code
 */
export class McpError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'McpError';
    this.statusCode = statusCode;
  }
}

/**
 * Wrap an async function to catch errors and convert them to McpError
 */
export function catchErrors<T extends (...args: any[]) => Promise<any>>(
  fn: T
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      
      console.error('Error in MCP tool:', error);
      
      // Convert generic error to McpError
      if (error instanceof Error) {
        throw new McpError(error.message);
      } else {
        throw new McpError('An unknown error occurred');
      }
    }
  };
}

/**
 * Format error for MCP response
 */
export function formatErrorResponse(error: unknown): { error: string } {
  if (error instanceof McpError) {
    return { error: error.message };
  } else if (error instanceof Error) {
    return { error: error.message };
  } else {
    return { error: 'An unknown error occurred' };
  }
}
