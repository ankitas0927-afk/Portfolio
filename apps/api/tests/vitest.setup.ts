import { afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongoServer = await MongoMemoryServer.create();

process.env.NODE_ENV = 'test';
process.env.PORT = '5000';
process.env.MONGODB_URI = mongoServer.getUri('ankita_portfolio_test');
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.API_PUBLIC_URL = 'http://localhost:5000';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_at_least_32_chars';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32_chars';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.COOKIE_SECURE = 'false';
process.env.COOKIE_SAME_SITE = 'lax';
process.env.ADMIN_NAME = 'Test Admin';
process.env.ADMIN_EMAIL = 'admin@example.com';
process.env.ADMIN_INITIAL_PASSWORD = 'StrongPass!123';
process.env.RESUME_PDF_PATH = 'seed-assets/ankita-resume.pdf';
process.env.PROFILE_IMAGE_PATH = '';
process.env.MAX_PROFILE_IMAGE_MB = '5';
process.env.MAX_CONTENT_IMAGE_MB = '8';
process.env.MAX_RESUME_MB = '10';
process.env.MAX_CERTIFICATE_MB = '10';
process.env.MAX_DOCUMENT_MB = '15';

afterAll(async () => {
  await mongoServer.stop();
});
