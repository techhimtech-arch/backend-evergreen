/**
 * Environment Variables Validator
 * Validates required environment variables at startup
 * Fails gracefully with clear error messages if any are missing
 */

const requiredEnvVars = [
  {
    name: 'MONGO_URI',
    description: 'MongoDB connection string',
  },
  {
    name: 'JWT_SECRET',
    description: 'Secret key for JWT token signing',
  },
  {
    name: 'FRONTEND_URL',
    description: 'Frontend application URL for CORS whitelist',
  },
];

const validateEnv = () => {
  const missingVars = [];

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar.name]) {
      missingVars.push(`  - ${envVar.name}: ${envVar.description}`);
    }
  });

  if (missingVars.length > 0) {
    console.error('\n❌ FATAL ERROR: Missing required environment variables:\n');
    console.error(missingVars.join('\n'));
    console.error('\n📝 Please add these to your .env file or environment configuration.\n');
    console.error('Example .env file:');
    console.error('  MONGO_URI=mongodb+srv://...');
    console.error('  JWT_SECRET=your-super-secret-key');
    console.error('  FRONTEND_URL=https://your-frontend-domain.com\n');
    process.exit(1);
  }

  console.log('✅ All required environment variables validated');
};

module.exports = validateEnv;
