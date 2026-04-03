const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Evergreen Plantation System API',
      version: '1.0.0',
      description: 'Backend APIs for Evergreen Group & Assignment Management',
    },
    servers: [
      // { url: 'https://sms-backend-d19v.onrender.com/api/v1', description: 'Production' },
      { url: 'http://localhost:5000/api/v1', description: 'Local Development' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token (without "Bearer " prefix)'
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/modules/**/*.routes.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};