# Nexaa Backend - Spring Boot API with MongoDB Atlas

A robust Spring Boot backend application with JWT authentication, MongoDB Atlas integration, and comprehensive security features for the Nexaa project.

## 🚀 Features

- **JWT Authentication**: Secure token-based authentication system
- **MongoDB Atlas Integration**: Cloud-based NoSQL database
- **Password Encryption**: BCrypt password hashing
- **CORS Support**: Cross-origin resource sharing configuration
- **Input Validation**: Comprehensive request validation
- **Security**: Spring Security with custom JWT filters
- **RESTful API**: Clean REST endpoints for authentication
- **Error Handling**: Centralized error handling and responses

## 📋 Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- MongoDB Atlas account
- IDE (IntelliJ IDEA, Eclipse, or VS Code)

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Nexaa/backend
```

### 2. Configure MongoDB Atlas

1. Create a MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Create a database user with read/write access
4. Get your connection string
5. Update `src/main/resources/application.properties`:

```properties
# Replace <username>, <password>, and <cluster-url> with your MongoDB Atlas credentials
spring.data.mongodb.uri=mongodb+srv://<username>:<password>@<cluster-url>/nexaa?retryWrites=true&w=majority
```

### 3. Configure JWT Secret

Update the JWT secret in `application.properties` for production:

```properties
# Generate a secure secret key for production
jwt.secret=YourSecureSecretKeyHere
```

### 4. Update CORS Origins

Update allowed origins in `application.properties`:

```properties
# Add your frontend URLs
cors.allowed-origins=http://localhost:3000,http://localhost:5173,https://yourapp.vercel.app
```

## 🏃‍♂️ Running the Application

### Using Maven
```bash
# Clean and compile
mvn clean compile

# Run the application
mvn spring-boot:run
```

### Using Java
```bash
# Build the JAR
mvn clean package

# Run the JAR
java -jar target/nexaa-backend-1.0.0.jar
```

The application will start on `http://localhost:8080`

## 📡 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/api/auth/signup` | Register new user | `{ "username": "string", "email": "string", "password": "string" }` |
| POST | `/api/auth/signin` | Sign in user | `{ "email": "string", "password": "string" }` |
| POST | `/api/auth/validate` | Validate JWT token | Query param: `token` |
| GET | `/api/auth/health` | Check auth service health | - |

### General Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/` | Welcome message |
| GET | `/api/health` | Application health check |

## 📝 Request/Response Examples

### Sign Up Request
```json
POST /api/auth/signup
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Sign Up Response
```json
{
  "message": "User registered successfully!"
}
```

### Sign In Request
```json
POST /api/auth/signin
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Sign In Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": "507f1f77bcf86cd799439011",
  "username": "johndoe",
  "email": "john@example.com",
  "roles": ["USER"],
  "expiresAt": "2024-11-06T10:30:00"
}
```

## 🔧 Configuration

### Database Configuration
- **Database**: MongoDB Atlas
- **Collection**: `users`
- **Indexes**: Unique indexes on `username` and `email`

### Security Configuration
- **Password Encoding**: BCrypt
- **JWT Expiration**: 24 hours (configurable)
- **CORS**: Configured for frontend integration
- **Session Management**: Stateless

### Environment Variables
You can override properties using environment variables:

```bash
export MONGODB_URI="your-mongodb-connection-string"
export JWT_SECRET="your-jwt-secret"
export SERVER_PORT=8080
```

## 🏗️ Project Structure

```
src/
├── main/
│   ├── java/com/nexaa/
│   │   ├── NexaaBackendApplication.java     # Main application class
│   │   ├── controller/                      # REST controllers
│   │   │   ├── AuthController.java
│   │   │   └── RootController.java
│   │   ├── dto/                             # Data Transfer Objects
│   │   │   ├── AuthResponse.java
│   │   │   ├── MessageResponse.java
│   │   │   ├── SignInRequest.java
│   │   │   └── SignUpRequest.java
│   │   ├── model/                           # Entity models
│   │   │   ├── Role.java
│   │   │   └── User.java
│   │   ├── repository/                      # Data access layer
│   │   │   └── UserRepository.java
│   │   ├── security/                        # Security configuration
│   │   │   ├── AuthEntryPointJwt.java
│   │   │   ├── AuthTokenFilter.java
│   │   │   └── WebSecurityConfig.java
│   │   ├── service/                         # Business logic
│   │   │   ├── AuthService.java
│   │   │   └── UserDetailsServiceImpl.java
│   │   └── util/                            # Utilities
│   │       ├── JwtUtils.java
│   │       └── UserPrincipal.java
│   └── resources/
│       └── application.properties           # Application configuration
└── test/                                    # Test files
```

## 🔍 Testing

### Using curl

**Sign Up:**
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

**Sign In:**
```bash
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Frontend Integration

For your React frontend, update the API base URL:

```javascript
const API_BASE_URL = 'http://localhost:8080/api';

// Sign up
const signUp = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};

// Sign in
const signIn = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return response.json();
};
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Verify your MongoDB Atlas connection string
   - Check if your IP is whitelisted in MongoDB Atlas
   - Ensure database credentials are correct

2. **JWT Token Invalid**
   - Check if the JWT secret is properly configured
   - Verify token format in Authorization header: `Bearer <token>`

3. **CORS Issues**
   - Update `cors.allowed-origins` in `application.properties`
   - Ensure frontend URL is included in allowed origins

4. **Port Already in Use**
   - Change the port in `application.properties`: `server.port=8081`
   - Or kill the process using the port: `lsof -ti:8080 | xargs kill`

## 📝 Development Notes

- The application uses Spring Boot 3.2.0 with Java 17
- JWT tokens expire after 24 hours by default
- User passwords are encrypted using BCrypt
- MongoDB auditing is enabled for created/updated timestamps
- CORS is configured to allow requests from frontend applications

## 🔒 Security Considerations

- Change the JWT secret in production
- Use environment variables for sensitive data
- Implement rate limiting for authentication endpoints
- Enable HTTPS in production
- Regularly update dependencies for security patches

## 📄 License

This project is part of the Nexaa application. Please refer to the main project license.