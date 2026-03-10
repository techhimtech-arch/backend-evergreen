# School Management System Backend

A clean, scalable, and production-ready Node.js Express backend for school management systems with modern authentication, RBAC, and comprehensive security features.

## 🏗️ Architecture

This project follows a modular MVC architecture with feature-based modules:

```
src/
├── config/                 # Configuration files
│   ├── env.js             # Environment configuration
│   ├── database.js        # Database connection
│   └── logger.js          # Winston logger setup
├── middleware/            # Express middleware
│   ├── auth.middleware.js # Authentication & authorization
│   ├── error.middleware.js # Centralized error handling
│   └── validation.middleware.js # Request validation
├── modules/               # Feature-based modules
│   ├── auth/              # Authentication module
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   ├── auth.routes.js
│   │   └── auth.validation.js
│   ├── users/             # User management module
│   │   ├── users.controller.js
│   │   ├── users.service.js
│   │   ├── users.routes.js
│   │   └── users.validation.js
│   └── roles/             # Role management module
│       ├── roles.controller.js
│       ├── roles.service.js
│       └── roles.routes.js
├── utils/                 # Utility functions
│   ├── jwt.js             # JWT token utilities
│   ├── password.js        # Password hashing & validation
│   └── response.js        # Standardized API responses
├── models/                # Database models
│   ├── User.js
│   ├── Role.js
│   ├── RefreshToken.js
│   └── LoginAudit.js
├── logs/                  # Log files directory
├── app.js                 # Express app configuration
└── server.js              # Server startup file
```

## 🚀 Features

### 🔐 Authentication System
- **JWT Access Tokens**: 15-minute expiry
- **Refresh Tokens**: 7-day expiry with rotation
- **Secure Password Hashing**: bcrypt with configurable rounds
- **Login Audit Trail**: Track all authentication events
- **Session Management**: View and revoke active sessions

### 👥 Role-Based Access Control (RBAC)
- **Predefined Roles**: Superadmin, School Admin, Teacher, Accountant, Parent, Student
- **Granular Permissions**: Fine-grained permission system
- **Role Management**: Create, update, and manage roles
- **Authorization Middleware**: Protect routes with role-based access

### 🛡️ Security Best Practices
- **Helmet**: Security HTTP headers
- **Rate Limiting**: Configurable rate limits (global and auth-specific)
- **CORS**: Secure cross-origin resource sharing
- **Input Sanitization**: XSS protection
- **Request Validation**: Comprehensive input validation

### 📝 Logging & Monitoring
- **Winston Logger**: Structured logging with multiple levels
- **Request Logging**: HTTP request tracking
- **Error Logging**: Comprehensive error reporting
- **Log Rotation**: Automatic log file management

### 🎯 Code Quality
- **Separation of Concerns**: Clear service/controller separation
- **Error Handling**: Centralized error management
- **Validation**: Request validation with express-validator
- **Consistent Responses**: Standardized API response format

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend-evergreen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize the database**
   ```bash
   npm run init-db
   ```

5. **Seed sample data (optional)**
   ```bash
   npm run seed
   ```

## 🌍 Environment Variables

Create a `.env` file with the following variables:

```env
# Environment
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/school_management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=10

# CORS
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

## 🚀 Quick Start

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!@#",
  "role": "student"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123!@#"
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

#### Logout
```http
POST /api/v1/auth/logout
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

### User Management Endpoints

#### Get Users (Admin only)
```http
GET /api/v1/users?page=1&limit=10&role=student
Authorization: Bearer access_token
```

#### Create User (Admin only)
```http
POST /api/v1/users
Authorization: Bearer access_token
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!@#",
  "role": "teacher"
}
```

#### Update User (Admin only)
```http
PUT /api/v1/users/:userId
Authorization: Bearer access_token
Content-Type: application/json

{
  "name": "Jane Smith",
  "isActive": true
}
```

### Role Management Endpoints

#### Get All Roles
```http
GET /api/v1/roles
Authorization: Bearer access_token
```

#### Create Role (Superadmin only)
```http
POST /api/v1/roles
Authorization: Bearer access_token
Content-Type: application/json

{
  "name": "custom_role",
  "description": "Custom role description",
  "permissions": ["users:read", "students:read"]
}
```

## 🔧 Default Users

After running `npm run seed`, the following users are created:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@school.com | Admin123!@# |
| School Admin | schooladmin@school.com | SchoolAdmin123!@# |
| Teacher | teacher@school.com | Teacher123!@# |
| Student | student@school.com | Student123!@# |

## 🛠️ Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run test suite
- `npm run init-db` - Initialize database with default roles
- `npm run seed` - Seed sample users

## 🔒 Security Features

- **Password Requirements**: Minimum 8 characters with uppercase, lowercase, numbers, and special characters
- **Token Rotation**: Refresh tokens are rotated on each use
- **Session Management**: Users can view and revoke active sessions
- **Rate Limiting**: Configurable rate limits to prevent abuse
- **Input Validation**: All inputs are validated and sanitized
- **CORS Protection**: Secure cross-origin resource sharing
- **Security Headers**: Helmet middleware for security headers

## 📊 Logging

Logs are stored in the `logs/` directory:
- `app.log` - General application logs
- `error.log` - Error-specific logs
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled promise rejections

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📈 Monitoring

The application includes comprehensive logging and monitoring:
- HTTP request logging
- Authentication event tracking
- Error reporting
- Performance metrics
- Security event logging

## 🔄 Database Models

### User
- Basic user information
- Role assignment
- Account status
- Password reset functionality

### Role
- Role definitions
- Permission assignments
- Role hierarchy

### RefreshToken
- Token storage
- Expiration management
- Revocation tracking

### LoginAudit
- Authentication events
- IP address tracking
- Device information
- Failed login attempts

## 🚀 Deployment

### Environment Setup
1. Set production environment variables
2. Configure database connection
3. Set up proper CORS origins
4. Configure logging for production

### Security Considerations
1. Use strong JWT secrets
2. Configure proper rate limits
3. Set up monitoring and alerting
4. Regular security updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please open an issue in the repository.