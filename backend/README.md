# Basic Express.js Backend

A simple Express.js backend with basic middleware and error handling.

## Features

- Express.js server setup
- CORS enabled
- Request logging with Morgan
- Environment variable support
- Basic error handling
- Health check endpoint
- JSON Filter API with advanced query support

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

### Filter API

The filter API allows you to query JSON data using a simple query language.

**Endpoint:** `POST /api/filter`

**Request Body:**
```json
{
    "query": "field = value",
    "filePath": "/path/to/your/json/file.json"
}
```

**Response:**
```json
{
    "success": true,
    "count": 2,
    "data": [
        // matching records
    ]
}
```

#### Supported Operators

1. **Comparison Operators:**
   - `=` - Equal to
   - `!=` - Not equal to
   - `>` - Greater than
   - `<` - Less than
   - `>=` - Greater than or equal to
   - `<=` - Less than or equal to

2. **String Operators:**
   - `LIKE` - SQL-style pattern matching
     - `%` matches any sequence of characters
     - `_` matches any single character
   - `NOT LIKE` - Inverse of LIKE
   - `CONTAINS` - Case-insensitive substring search
   - `NOT CONTAINS` - Inverse of CONTAINS
   - `REGEX` - Regular expression matching

3. **List Operators:**
   - `IN` - Check if value exists in a list
   - `NOT IN` - Check if value doesn't exist in a list

4. **Logical Operators:**
   - `AND` - Logical AND
   - `OR` - Logical OR

#### Query Examples

```javascript
// Simple comparison
"customer.name = 'John'"
"customer.age > 25"

// Pattern matching
"customer.name LIKE 'John%'"
"customer.name LIKE '%son'"
"customer.name LIKE 'J_n'"

// String contains
"customer.name CONTAINS 'son'"
"customer.name NOT CONTAINS 'blocked'"

// Regular expression
"customer.email REGEX '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'"

// List operations
"customer.status IN ['active', 'pending']"
"customer.status NOT IN ['inactive', 'blocked']"

// Complex queries
"customer.name LIKE 'John%' AND customer.status IN ['active', 'pending']"
"(customer.age > 25 OR customer.status = 'active') AND customer.createdAt < '2024-01-01'"
```

#### Notes

- All string comparisons are case-insensitive
- Date values are automatically parsed
- Numbers are automatically converted
- Nested object properties can be accessed using dot notation (e.g., `customer.address.city`)
- Complex queries can be grouped using parentheses

## Error Handling

The server includes basic error handling middleware that will:
- Log errors to the console
- Return appropriate error responses
- Hide detailed error messages in production 