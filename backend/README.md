# Basic Express.js Backend

A simple Express.js backend with basic middleware and error handling.

## Features

- Express.js server setup
- CORS enabled
- Request logging with Morgan
- Environment variable support
- Basic error handling
- Health check endpoint

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following content:
```
PORT=3000
NODE_ENV=development
```

3. Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:3000

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm test` - Run tests (not configured yet)

## API Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check endpoint

## Error Handling

The server includes basic error handling middleware that will:
- Log errors to the console
- Return appropriate error responses
- Hide detailed error messages in production 