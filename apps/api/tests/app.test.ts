import bcrypt from 'bcrypt';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';

import type { Express } from 'express';

let app: Express;
let connectToDatabase: () => Promise<typeof mongoose>;
let disconnectFromDatabase: () => Promise<void>;
let AdminModel: typeof import('../src/models/index.js').AdminModel;
let PersonalProfileModel: typeof import('../src/models/index.js').PersonalProfileModel;

describe('API application', () => {
  beforeAll(async () => {
    const appModule = await import('../src/app.js');
    const dbModule = await import('../src/database/mongoose.js');
    const modelModule = await import('../src/models/index.js');

    app = appModule.createApp();
    connectToDatabase = dbModule.connectToDatabase;
    disconnectFromDatabase = dbModule.disconnectFromDatabase;
    AdminModel = modelModule.AdminModel;
    PersonalProfileModel = modelModule.PersonalProfileModel;

    await connectToDatabase();
  });

  beforeEach(async () => {
    await mongoose.connection.db!.dropDatabase();
  });

  afterAll(async () => {
    await disconnectFromDatabase();
  });

  it('returns a healthy response', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
  });

  it('allows configured frontend origins for CORS', async () => {
    const response = await request(app)
      .options('/api/v1/auth/login')
      .set('Origin', 'https://preview.ankita-portfolio.vercel.app')
      .set('Access-Control-Request-Method', 'POST');

    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe(
      'https://preview.ankita-portfolio.vercel.app',
    );
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  it('does not allow unexpected frontend origins for CORS', async () => {
    const response = await request(app)
      .options('/api/v1/auth/login')
      .set('Origin', 'https://malicious.example.com')
      .set('Access-Control-Request-Method', 'POST');

    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('rejects invalid login attempts', async () => {
    await AdminModel.create({
      name: 'Admin',
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('CorrectPass!123', 12),
      role: 'owner',
    });

    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@example.com',
      password: 'WrongPassword!9',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns only public profile fields from the public endpoint', async () => {
    await PersonalProfileModel.create({
      fullName: 'Ankita Singh',
      professionalTitle: 'Research Analyst',
      rotatingTitles: ['Research Analyst'],
      shortIntroduction: 'Short introduction',
      professionalSummary: 'Professional summary',
      careerObjective: 'Career objective',
      generalLocation: 'Lucknow, India',
      availability: 'open_to_work',
      publicEmail: 'public@example.com',
      publicPhone: '+91 1234567890',
      publicationStatus: 'published',
    });

    const response = await request(app).get('/api/v1/public/profile');

    expect(response.status).toBe(200);
    expect(response.body.data.fullName).toBe('Ankita Singh');
    expect(response.body.data.publicEmail).toBe('public@example.com');
    expect(response.body.data.privateEmail).toBeUndefined();
  });
});
