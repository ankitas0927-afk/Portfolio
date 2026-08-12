import bcrypt from 'bcryptjs';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';

import type { Express } from 'express';

let app: Express;
let connectToDatabase: () => Promise<typeof mongoose>;
let disconnectFromDatabase: () => Promise<void>;
let AdminModel: typeof import('../src/models/index.js').AdminModel;
let AdminSessionModel: typeof import('../src/models/index.js').AdminSessionModel;
let PersonalProfileModel: typeof import('../src/models/index.js').PersonalProfileModel;
let RefreshTokenModel: typeof import('../src/models/index.js').RefreshTokenModel;

describe('API application', () => {
  beforeAll(async () => {
    const appModule = await import('../src/app.js');
    const dbModule = await import('../src/database/mongoose.js');
    const modelModule = await import('../src/models/index.js');

    app = appModule.createApp();
    connectToDatabase = dbModule.connectToDatabase;
    disconnectFromDatabase = dbModule.disconnectFromDatabase;
    AdminModel = modelModule.AdminModel;
    AdminSessionModel = modelModule.AdminSessionModel;
    PersonalProfileModel = modelModule.PersonalProfileModel;
    RefreshTokenModel = modelModule.RefreshTokenModel;

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

  it('allows valid login when legacy blank refresh-token hashes already exist', async () => {
    const admin = await AdminModel.create({
      name: 'Admin',
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('CorrectPass!123', 12),
      role: 'owner',
    });

    const staleSession = await AdminSessionModel.create({
      adminId: admin._id,
      ipAddress: '127.0.0.1',
      userAgent: 'legacy-client',
      isActive: false,
      lastActivityAt: new Date(),
    });

    await RefreshTokenModel.collection.insertOne({
      adminId: admin._id,
      sessionId: staleSession._id,
      tokenHash: '',
      expiresAt: new Date(Date.now() + 60_000),
      createdByIp: '127.0.0.1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@example.com',
      password: 'CorrectPass!123',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.admin.email).toBe('admin@example.com');
    expect(response.headers['set-cookie']).toBeDefined();
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
