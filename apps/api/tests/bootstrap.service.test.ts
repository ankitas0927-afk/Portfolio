import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

let connectToDatabase: () => Promise<typeof mongoose>;
let disconnectFromDatabase: () => Promise<void>;
let ensurePortfolioSeed: typeof import('../src/services/bootstrap.service.js').ensurePortfolioSeed;
let AboutModel: typeof import('../src/models/index.js').AboutModel;
let ExperienceModel: typeof import('../src/models/index.js').ExperienceModel;
let EducationModel: typeof import('../src/models/index.js').EducationModel;
let HeroModel: typeof import('../src/models/index.js').HeroModel;
let InterestModel: typeof import('../src/models/index.js').InterestModel;
let LanguageModel: typeof import('../src/models/index.js').LanguageModel;
let NavigationItemModel: typeof import('../src/models/index.js').NavigationItemModel;
let PersonalProfileModel: typeof import('../src/models/index.js').PersonalProfileModel;
let ProjectModel: typeof import('../src/models/index.js').ProjectModel;
let ResumeModel: typeof import('../src/models/index.js').ResumeModel;
let SiteSettingsModel: typeof import('../src/models/index.js').SiteSettingsModel;
let SkillCategoryModel: typeof import('../src/models/index.js').SkillCategoryModel;
let SkillModel: typeof import('../src/models/index.js').SkillModel;
let PersonalSkillModel: typeof import('../src/models/index.js').PersonalSkillModel;
let ProfessionalTrainingModel: typeof import('../src/models/index.js').ProfessionalTrainingModel;

describe('portfolio bootstrap', () => {
  beforeAll(async () => {
    const dbModule = await import('../src/database/mongoose.js');
    const bootstrapModule = await import('../src/services/bootstrap.service.js');
    const modelModule = await import('../src/models/index.js');

    connectToDatabase = dbModule.connectToDatabase;
    disconnectFromDatabase = dbModule.disconnectFromDatabase;
    ensurePortfolioSeed = bootstrapModule.ensurePortfolioSeed;
    AboutModel = modelModule.AboutModel;
    ExperienceModel = modelModule.ExperienceModel;
    EducationModel = modelModule.EducationModel;
    HeroModel = modelModule.HeroModel;
    InterestModel = modelModule.InterestModel;
    LanguageModel = modelModule.LanguageModel;
    NavigationItemModel = modelModule.NavigationItemModel;
    PersonalProfileModel = modelModule.PersonalProfileModel;
    ProjectModel = modelModule.ProjectModel;
    ResumeModel = modelModule.ResumeModel;
    SiteSettingsModel = modelModule.SiteSettingsModel;
    SkillCategoryModel = modelModule.SkillCategoryModel;
    SkillModel = modelModule.SkillModel;
    PersonalSkillModel = modelModule.PersonalSkillModel;
    ProfessionalTrainingModel = modelModule.ProfessionalTrainingModel;

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

  it('publishes an existing draft profile and fills missing public portfolio sections', async () => {
    await PersonalProfileModel.create({
      fullName: 'Ankita Singh',
      professionalTitle: 'Research Analyst | Pharmacy Graduate | Quality Control Trainee',
      rotatingTitles: ['Research Analyst'],
      shortIntroduction: 'Intro',
      professionalSummary: 'Summary',
      careerObjective: 'Objective',
      generalLocation: 'Sankrail, Howrah, West Bengal, India',
      availability: 'open_to_work',
      publicationStatus: 'draft',
    });

    const result = await ensurePortfolioSeed(new mongoose.Types.ObjectId().toString());
    const profile = await PersonalProfileModel.findOne({ publicationStatus: 'published' }).lean();

    expect(result).toMatchObject({ seeded: false, ensuredMissingContent: true });
    expect(profile?.fullName).toBe('Ankita Singh');
    expect(await ResumeModel.countDocuments({ isActive: true, publicationStatus: 'published' })).toBe(1);
    expect(await NavigationItemModel.countDocuments({ publicationStatus: 'published' })).toBe(7);
    expect(await ExperienceModel.countDocuments({ publicationStatus: 'published' })).toBe(1);
    expect(await EducationModel.countDocuments({ publicationStatus: 'published' })).toBe(3);
    expect(await ProfessionalTrainingModel.countDocuments({ publicationStatus: 'published' })).toBe(1);
    expect(await SkillCategoryModel.countDocuments({ publicationStatus: 'published' })).toBeGreaterThan(0);
    expect(await SkillModel.countDocuments({ publicationStatus: 'published' })).toBeGreaterThan(0);
    expect(await PersonalSkillModel.countDocuments({ publicationStatus: 'published' })).toBeGreaterThan(0);
    expect(await ProjectModel.countDocuments({ publicationStatus: 'published' })).toBe(1);
    expect(await LanguageModel.countDocuments({ publicationStatus: 'published' })).toBe(2);
  });

  it('repairs generic hero, about, and site settings while preserving the existing profile', async () => {
    const profile = await PersonalProfileModel.create({
      fullName: 'Ankita Singh',
      professionalTitle: 'Research Analyst | Pharmacy Graduate | Quality Control Trainee',
      rotatingTitles: ['Research Analyst'],
      shortIntroduction: 'Dedicated pharmacy graduate',
      professionalSummary: 'Working as a research analyst with strong analytical discipline.',
      careerObjective: 'Build a dependable research and quality-focused career.',
      generalLocation: 'Sankrail, Howrah, West Bengal, India',
      availability: 'open_to_work',
      publicationStatus: 'published',
    });

    await Promise.all([
      HeroModel.create({
        heading: 'Professional Portfolio',
        subheading: 'Professional portfolio content sourced from the database.',
        ctaPrimaryLabel: 'View Resume',
        ctaPrimaryHref: '/resume',
        publicationStatus: 'published',
      }),
      AboutModel.create({
        fullBiography: 'Professional portfolio content sourced from the database.',
        currentLocation: 'Location available on request',
        publicationStatus: 'published',
      }),
      SiteSettingsModel.create({
        siteName: 'Professional Portfolio',
        siteTagline: 'Portfolio',
        accentColor: '#123456',
        secondaryAccentColor: '#654321',
      }),
    ]);

    const result = await ensurePortfolioSeed(new mongoose.Types.ObjectId().toString());
    const [hero, about, siteSettings, updatedProfile] = await Promise.all([
      HeroModel.findOne({ publicationStatus: 'published' }).lean(),
      AboutModel.findOne({ publicationStatus: 'published' }).lean(),
      SiteSettingsModel.findOne({}).lean(),
      PersonalProfileModel.findById(profile._id).lean(),
    ]);

    expect(result).toMatchObject({ seeded: false, ensuredMissingContent: true });
    expect(hero?.heading).toBe('Ankita Singh');
    expect(hero?.subheading).toContain('Detail-oriented and dedicated pharmacy graduate');
    expect(about?.fullBiography).toContain('currently works as a Research Analyst');
    expect(about?.currentLocation).toContain('Sankrail, Howrah, West Bengal, India');
    expect(siteSettings?.siteName).toBe('Ankita Singh');
    expect(siteSettings?.siteTagline).toBe('Research Analyst | Pharmacy Graduate');
    expect(updatedProfile?.profileImageId).toBeTruthy();
    expect(siteSettings?.logoId).toBeTruthy();
    expect(siteSettings?.faviconId).toBeTruthy();
  });
});
