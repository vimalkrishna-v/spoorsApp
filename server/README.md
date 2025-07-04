# Spoors App Server

A Node.js/Express server with JWT-based authentication and role-based authorization for Business Development (BD) and Administrator (Adm) users.

## Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Authorization**: BD and Admin roles with different permissions
- **MongoDB Integration**: User data stored in MongoDB with password hashing
- **Input Validation**: Comprehensive request validation middleware
- **Error Handling**: Global error handling with detailed error responses
- **Security**: CORS, security headers, and password hashing with bcrypt
- **Production Ready**: Clean code structure following best practices

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Custom middleware
- **Environment**: dotenv for configuration

## Project Structure

```
server/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── dashboardController.js # Dashboard logic
├── middleware/
│   ├── auth.js             # JWT authentication & authorization
│   ├── validation.js       # Input validation
│   └── errorHandler.js     # Global error handling
├── models/
│   └── User.js             # User model schema
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── dashboard.js        # Dashboard routes
│   └── api.js              # General API routes
├── scripts/
│   └── seedUsers.js        # Database seeding script
├── utils/
│   └── tokenUtils.js       # JWT utility functions
├── .env                    # Environment variables
├── index.js               # Main server file
└── package.json           # Dependencies and scripts
```

## Installation

1. **Clone the repository and navigate to server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   The `.env` file is already configured with sample values. Update as needed:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/spoors_app
   JWT_SECRET=your_super_secure_jwt_secret_key_change_this_in_production
   JWT_EXPIRES_IN=24h
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

4. **Start MongoDB** (make sure MongoDB is running on your system)

5. **Seed the database with sample users**:
   ```bash
   npm run seed
   ```

6. **Start the server**:
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

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

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "bd.user@spoors.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "_id": "...",
    "email": "bd.user@spoors.com",
    "role": "BD",
    "isActive": true,
    "lastLogin": "2025-07-04T...",
    "createdAt": "2025-07-04T...",
    "updatedAt": "2025-07-04T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

#### POST /api/auth/register
Register a new user (for development/admin purposes).

**Request Body:**
```json
{
  "email": "new.user@spoors.com",
  "password": "password123",
  "role": "BD"
}
```

**Response:**
```json
{
  "user": {
    "_id": "...",
    "email": "new.user@spoors.com",
    "role": "BD",
    "isActive": true,
    "createdAt": "2025-07-04T...",
    "updatedAt": "2025-07-04T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "User registered successfully"
}
```

#### POST /api/auth/logout
Logout the current user (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Logout successful"
}
```

#### GET /api/auth/me
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "user": {
    "_id": "...",
    "email": "bd.user@spoors.com",
    "role": "BD",
    "isActive": true,
    "lastLogin": "2025-07-04T...",
    "createdAt": "2025-07-04T...",
    "updatedAt": "2025-07-04T..."
  },
  "message": "User data retrieved successfully"
}
```

### Dashboard Endpoints

All dashboard endpoints require authentication via JWT token in the Authorization header.

#### GET /api/dashboard
Get dashboard data based on user role.

#### GET /api/dashboard/bd
Get BD-specific dashboard (BD role only).

#### GET /api/dashboard/admin
Get Admin-specific dashboard (Admin role only).

### General Endpoints

#### GET /
Server status and information.

#### GET /health
Health check endpoint.

## Frontend Integration

The API is designed to work seamlessly with React frontends. Key integration points:

### Authentication Flow
1. **Login**: `POST /api/auth/login` → Receive user object and JWT token
2. **Store Token**: Save JWT token in localStorage or secure storage
3. **Authenticated Requests**: Include `Authorization: Bearer <token>` header
4. **Get User**: `GET /api/auth/me` → Get current user data
5. **Logout**: `POST /api/auth/logout` → Clear token from storage

### Example Frontend Usage
```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { user, token, message } = await response.json();

// Store token
localStorage.setItem('authToken', token);

// Authenticated request
const userResponse = await fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { user } = await userResponse.json();
```
