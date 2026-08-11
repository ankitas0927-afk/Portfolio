import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

let connectToDatabase: () => Promise<typeof mongoose>;
let disconnectFromDatabase: () => Promise<void>;
let ensurePortfolioSeed: typeof import('../src/services/bootstrap.service.js').ensurePortfolioSeed;
let EducationModel: typeof import('../src/models/index.js').EducationModel;
let InterestModel: typeof import('../src/models/index.js').InterestModel;
let NavigationItemModel: typeof import('../src/models/index.js').NavigationItemModel;
let PersonalProfileModel: typeof import('../src/models/index.js').PersonalProfileModel;
let ResumeModel: typeof import('../src/models/index.js').ResumeModel;
let SiteSettingsModel: typeof import('../src/models/index.js').SiteSettingsModel;

describe('portfolio bootstrap', () => {
  beforeAll(async () => {
    const dbModule = await import('../src/database/mongoose.js');
    const bootstrapModule = await import('../src/services/bootstrap.service.js');
    const modelModule = await import('../src/models/index.js');

    connectToDatabase = dbModule.connectToDatabase;
    disconnectFromDatabase = dbModule.disconnectFromDatabase;
    ensurePortfolioSeed = bootstrapModule.ensurePortfolioSeed;
    EducationModel = modelModule.EducationModel;
    InterestModel = modelModule.InterestModel;
    NavigationItemModel = modelModule.NavigationItemModel;
    PersonalProfileModel = modelModule.PersonalProfileModel;
    ResumeModel = modelModule.ResumeModel;
    SiteSettingsModel = modelModule.SiteSettingsModel;

    await connectToDatabase();
  });

  beforeEach(async () => {
    await mongoose.connection.db!.dropDatabase();
  });

  afterAll(async () => {
    await disconnectFromDatabase();
  });

  it('replaces generic placeholder content with Ankita CV content', async () => {
    await PersonalProfileModel.create({
      fullName: 'Professional Portfolio',
      professionalTitle: 'Professional Portfolio',
      rotatingTitles: [],
      shortIntroduction: 'A refined portfolio of experience, skills, and professional highlights.',
      professionalSummary: 'A professional portfolio showcasing experience and career highlights.',
      careerObjective: 'Portfolio content is loading.',
      generalLocation: 'Location available on request',
      availability: 'open_to_work',
      publicationStatus: 'published',
    });

    const result = await ensurePortfolioSeed(new mongoose.Types.ObjectId().toString());
    const profile = await PersonalProfileModel.findOne({ publicationStatus: 'published' }).lean();
    const siteSettings = await SiteSettingsModel.findOne({}).lean();

    expect(result).toMatchObject({ seeded: true, repairedPlaceholders: true });
    expect(profile?.fullName).toBe('Ankita Singh');
    expect(profile?.generalLocation).toContain('Sankrail, Howrah, West Bengal, India');
    expect(profile?.professionalSummary).toContain('Research Analyst');
    expect(await NavigationItemModel.countDocuments({ publicationStatus: 'published' })).toBe(7);
    expect(
      await ResumeModel.countDocuments({ isActive: true, publicationStatus: 'published' }),
    ).toBe(1);
    expect(siteSettings?.siteName).toBe('Ankita Singh');
    expect(siteSettings?.logoId).toBeTruthy();
    expect(siteSettings?.faviconId).toBeTruthy();
  });

  it('refreshes outdated legacy resume seed content to match the current resume', async () => {
    await PersonalProfileModel.create({
      fullName: 'Ankita Singh',
      professionalTitle: 'Research Analyst | Pharmacy Graduate | Quality Control',
      rotatingTitles: ['Research Analyst'],
      shortIntroduction: 'Intro',
      professionalSummary: 'Summary',
      careerObjective: 'Objective',
      generalLocation: 'Sankrail, Howrah, West Bengal, India',
      availability: 'open_to_work',
      publicationStatus: 'published',
    });

    await EducationModel.create({
      institution: 'Veer Bahadur Singh Purvanchal University',
      qualification: 'Bachelor of Science',
      publicationStatus: 'published',
      displayOrder: 0,
    });

    await InterestModel.create({
      title: 'Watching films',
      publicationStatus: 'published',
      displayOrder: 0,
    });

    const result = await ensurePortfolioSeed(new mongoose.Types.ObjectId().toString());
    const education = await EducationModel.find(
      { publicationStatus: 'published' },
      { qualification: 1, _id: 0 },
    )
      .sort({ displayOrder: 1 })
      .lean<Array<{ qualification: string }>>();

    expect(result).toMatchObject({ seeded: true, refreshedLegacySeed: true });
    expect(education.map((item) => item.qualification)).toEqual([
      'Bachelor of Pharmacy',
      'Intermediate, Class XII',
      'High School, Class X',
    ]);
    expect(await InterestModel.countDocuments({ publicationStatus: 'published' })).toBe(0);
  });
});
