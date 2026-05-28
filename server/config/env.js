require('dotenv').config();

const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnv.join(', ')}`);
}

const getClientOrigins = () => {
  const values = [
    process.env.CLIENT_URL,
    process.env.CLIENT_URLS
  ]
    .filter(Boolean)
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set(values)];
};

module.exports = {
  appName: process.env.APP_NAME || 'FoodBridge',
  appUrl: process.env.APP_URL || process.env.CLIENT_URL,
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  emailService: process.env.EMAIL_SERVICE || 'Gmail',
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  clientOrigins: getClientOrigins()
};
