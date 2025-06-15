# JSON Query Builder Backend

This is the backend API for the JSON Query Builder.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Available Variables

- `PORT`: The port number to run the server on (default: 3000)
- `NODE_ENV`: The environment mode (development/production) (default: development)
- `CORS_ORIGIN`: The allowed origin for CORS (default: http://localhost:5173)

## Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The server will be available at http://localhost:3000

## API Endpoints

### Filter Data
- **POST** `/api/filter`
  - Request body:
    ```json
    {
      "query": "string",
      "filePath": "string"
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "count": number,
      "data": array
    }
    ```

### Get Field Suggestions
- **GET** `/api/suggestions`
  - Query parameters:
    - `searchTerm`: string
    - `filePath`: string
  - Response:
    ```json
    {
      "success": true,
      "suggestions": string[]
    }
    ```

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

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm test` - Run tests (not configured yet)
- `npm run generate-data` - Generate sample JSON data for testing

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

##### Basic Queries
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
```

##### Complex Query Examples

1. **User Profile Query**
```json
{
    "query": "age > 30 AND preferences.theme = 'dark' AND metrics.rating > 4.5 AND subscription.plan IN ['premium', 'enterprise'] AND tags IN ['technology', 'science']",
    "filePath": "backend/data/large-dataset.json"
}
```
Finds premium users who are over 30, use dark theme, have high ratings, and are interested in technology/science.

2. **Location and Activity Based Query**
```json
{
    "query": "address.country = 'United States' AND metrics.views > 10000 AND metrics.likes > 1000 AND lastLogin.device = 'desktop' AND preferences.notifications.email = true",
    "filePath": "backend/data/large-dataset.json"
}
```
Finds active US users with high engagement who use desktop and have email notifications enabled.

3. **Time and Status Based Query**
```json
{
    "query": "createdAt > '2023-01-01' AND status = 'active' AND metrics.comments > 100 AND preferences.privacy.profileVisibility = 'public' AND language IN ['English', 'Spanish']",
    "filePath": "backend/data/large-dataset.json"
}
```
Finds recently created active accounts with high engagement, public profiles, and English/Spanish language preference.

4. **Social Media Query**
```json
{
    "query": "socialProfiles.twitter != '' AND socialProfiles.github != '' AND bio CONTAINS 'developer' AND tags IN ['technology', 'programming'] AND metrics.shares > 500",
    "filePath": "backend/data/large-dataset.json"
}
```
Finds developers with both Twitter and GitHub profiles who are active in the tech community.

5. **Most Complex Query**
```json
{
    "query": "(age > 25 AND age < 40) AND (metrics.rating > 4.0 OR metrics.views > 50000) AND (subscription.plan = 'premium' OR subscription.plan = 'enterprise') AND (preferences.theme = 'dark' OR preferences.theme = 'system') AND (tags IN ['technology', 'science'] OR bio CONTAINS 'research') AND (address.country = 'United States' OR address.country = 'Canada') AND (createdAt > '2023-01-01' AND status = 'active')",
    "filePath": "backend/data/large-dataset.json"
}
```
Complex query combining multiple conditions with nested AND/OR operations.

6. **Engagement and Privacy Query**
```json
{
    "query": "metrics.likes > 1000 AND metrics.shares > 100 AND metrics.comments > 50 AND preferences.privacy.showEmail = false AND preferences.privacy.showPhone = false AND preferences.privacy.profileVisibility = 'private' AND lastLogin.timestamp > '2024-01-01'",
    "filePath": "backend/data/large-dataset.json"
}
```
Finds highly engaged but privacy-conscious users who have logged in recently.

7. **Language and Content Query**
```json
{
    "query": "(language = 'Sindhi' OR language = 'Uyghur') AND (bio LIKE '%technology%' OR bio LIKE '%science%') AND metrics.views > 5000 AND tags IN ['technology', 'science', 'education']",
    "filePath": "backend/data/large-dataset.json"
}
```
Finds users who speak Sindhi or Uyghur and are interested in technology/science.

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