# Spoors App Server

A simple Express.js server with clean directory structure.

## Getting Started

### Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   Or for production:
   ```bash
   npm start
   ```

The server will run on `http://localhost:5000`

## Project Structure

```
server/
├── index.js              # Main server file
├── package.json           # Dependencies and scripts
├── routes/
│   └── api.js            # API routes
└── README.md             # This file
```

## Available Routes

- `GET /` - Welcome message
- `GET /api` - API status
- `GET /api/users` - Sample users endpoint

## Adding New Routes

1. Create new route files in the `routes/` directory
2. Import and use them in `index.js`

Example:
```javascript
// In routes/products.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Products endpoint' });
});

module.exports = router;

// In index.js
const productRoutes = require('./routes/products');
app.use('/api/products', productRoutes);
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
