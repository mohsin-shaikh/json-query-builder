# JSON Query Builder Frontend

This is the frontend application for the JSON Query Builder.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### Available Variables

- `VITE_API_BASE_URL`: The base URL of the backend API (default: http://localhost:3000)

## Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173

## Building for Production

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory.
