# Jazz MCP Server

A Model Context Protocol (MCP) server that enables AI assistants to interact with local-first apps built with the [Jazz framework](https://jazz.tools/).

## What is this?

The Jazz MCP Server allows AI assistants like Claude, ChatGPT, and others to:

- Create, read, update, and delete data in Jazz applications
- Sync data between devices using Jazz's distributed state capabilities
- Manage authentication and user profiles
- Work with rich text, media, and other data types supported by Jazz

## Prerequisites

- Node.js 22.x or higher
- npm or pnpm
- A Jazz application to connect to (or create one with `npx create-jazz-app@latest`)

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/bensleveritt/jazz-mcp-server.git
   cd jazz-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   # or with pnpm
   pnpm install
   ```

3. Copy the environment example file and configure it for your needs:
   ```bash
   cp .env.example .env
   ```

4. Build the server:
   ```bash
   npm run build
   # or with pnpm
   pnpm build
   ```

## Usage

Start the MCP server:

```bash
npm start
# or with pnpm
pnpm start
```

For development with auto-restart:

```bash
npm run dev
# or with pnpm
pnpm dev
```

## Connecting AI Assistants

The server exposes an MCP-compatible API at `http://localhost:3000` (or your configured host/port).

### In Cursor

1. Open a project in Cursor
2. Click on the Cursor AI settings
3. Add a custom MCP server with the URL `http://localhost:3000`
4. Use the API key configured in your `.env` file (if auth is enabled)

### In Other AI Assistants

Follow the relevant documentation for your AI assistant to connect to an MCP server at the URL `http://localhost:3000`.

## Available Tools

This MCP server provides the following tools for AI assistants:

- `jazz.listApps` - List available Jazz applications
- `jazz.getAppData` - Get data from a Jazz application
- `jazz.updateAppData` - Update data in a Jazz application
- `jazz.createAppData` - Create new data in a Jazz application
- `jazz.deleteAppData` - Delete data from a Jazz application
- `jazz.auth.createUser` - Create a new user
- `jazz.auth.login` - Log in an existing user

## Development

The server is built with TypeScript and uses the official MCP protocol implementation. 

Key files:
- `src/index.ts` - Main entry point
- `src/config.ts` - Configuration loading
- `src/server.ts` - MCP server implementation
- `src/tools/` - Individual tool implementations
- `src/jazz/` - Jazz integration

## License

MIT
