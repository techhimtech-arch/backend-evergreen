const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./utils/logger');
const requestIdMiddleware = require('./middlewares/requestId');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const classRoutes = require('./routes/classRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const studentRoutes = require('./routes/studentRoutes');
const admissionRoutes = require('./routes/admissionRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const enrollmentAttendanceRoutes = require('./routes/enrollmentAttendanceRoutes');
const feesRoutes = require('./routes/feesRoutes');
const examsResultsRoutes = require('./routes/examsResultsRoutes');
const parentRoutes = require('./routes/parentRoutes');
const parentPortalRoutes = require('./routes/parentPortalRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const teacherAssignmentRoutes = require('./routes/teacherAssignmentRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const classTeacherRoutes = require('./routes/classTeacherRoutes');
// Phase 3 routes
const academicYearRoutes = require('./routes/academicYearRoutes');
const reportRoutes = require('./routes/reportRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
// Enrollment system routes
const enrollmentRoutes = require('./routes/enrollmentRoutes');
// Announcement system routes
const announcementRoutes = require('./routes/announcementRoutes');

// Middleware imports
const { globalLimiter, authLimiter } = require('./middlewares/rateLimiter');
const { corsErrorHandler, notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');

// Swagger
const { swaggerUi, swaggerSpec } = require('../swagger');

const app = express();

// ===========================================
// REQUEST TRACKING (Must be first)
// ===========================================
app.use(requestIdMiddleware);

// ===========================================
// SECURITY MIDDLEWARE (ORDER MATTERS!)
// ===========================================

// 1. Helmet - Set security HTTP headers
// Must come before other middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin for API
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Required for Swagger UI
      scriptSrc: ["'self'", "'unsafe-inline'"], // Required for Swagger UI
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// 2. CORS - Secure Cross-Origin Resource Sharing
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim())
  : [];

// Allow localhost for development (Swagger UI)
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5000', 'http://127.0.0.1:5000');
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  maxAge: 86400, // Cache preflight for 24 hours
};

app.use(cors(corsOptions));

// 3. Global Rate Limiting - 100 requests per 15 minutes
app.use(globalLimiter);

// 4. Body Parser
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent DoS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. HTTP Request Logging (Morgan with Winston)
const morganFormat = ':method :url :status :response-time ms';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim(), { type: 'http' }),
  },
  // Skip logging for health checks to reduce noise
  skip: (req, res) => req.url === '/health',
}));

// ===========================================
// PUBLIC ROUTES (No auth required)
// ===========================================

// Health check endpoint (for Render, load balancers, etc.)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ===========================================
// API ROUTES (v1)
// ===========================================

// Auth routes with stricter rate limiting (10 requests per 15 min)
app.use('/api/v1/auth', authLimiter, authRoutes);

// Protected routes (global rate limit already applied)
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/sections', sectionRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/admission', admissionRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/attendance/enrollments', enrollmentAttendanceRoutes);
app.use('/api/v1/fees', feesRoutes);
app.use('/api/v1/results', examsResultsRoutes);
app.use('/api/v1/parents', parentRoutes);
app.use('/api/v1/parent', parentPortalRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/teacher-assignments', teacherAssignmentRoutes);
app.use('/api/v1/subjects', subjectRoutes);
app.use('/api/v1/class-teacher', classTeacherRoutes);
app.use('/api/v1/academic-years', academicYearRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/audit-logs', auditLogRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/announcements', announcementRoutes);

// ===========================================
// ERROR HANDLING
// ===========================================
app.use(corsErrorHandler);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;