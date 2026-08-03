import React from 'react';
import { render, screen } from '@testing-library/react';

import { HomePage } from '@/components/portfolio/home-page';

describe('HomePage', () => {
  it('renders key public sections', () => {
    render(
      <HomePage
        profile={{
          id: '1',
          fullName: 'Ankita Singh',
          professionalTitle: 'Research Analyst',
          rotatingTitles: ['Research Analyst'],
          shortIntroduction: 'Intro',
          professionalSummary: 'Summary',
          careerObjective: 'Objective',
          generalLocation: 'Lucknow, India',
          availability: 'open_to_work',
          socialLinks: [],
        }}
        hero={{
          heading: 'Research Analyst and Pharmacy Graduate',
          subheading: 'Pharmaceutical portfolio',
          highlights: ['Highlight one'],
          ctaPrimaryLabel: 'View Resume',
          ctaPrimaryHref: '/resume',
        }}
        about={{
          fullBiography: 'Full bio',
          keyStrengths: ['Quality focus'],
        }}
        experience={[]}
        education={[]}
        training={[]}
        skills={{ categories: [], skills: [], personalSkills: [] }}
        featuredProjects={[
          {
            id: 'project-1',
            slug: 'project-one',
            title: 'Project One',
            shortDescription: 'Short project description',
            datePrecision: 'duration',
            objectives: [],
            toolsAndTechnologies: ['ChemDraw'],
            responsibilities: [],
            mainFeatures: [],
            challenges: [],
            solutions: [],
            outcomes: [],
            learningOutcomes: [],
            galleryImages: [],
            supportingDocuments: [],
            featured: true,
            publicationStatus: 'published',
            displayOrder: 0,
          },
        ]}
        languages={[]}
        interests={[]}
        resume={null}
      />,
    );

    expect(screen.getByRole('heading', { name: /Research Analyst and Pharmacy Graduate/i })).toBeInTheDocument();
    expect(screen.getByText('Project One')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View Resume/i })).toBeInTheDocument();
  });
});
