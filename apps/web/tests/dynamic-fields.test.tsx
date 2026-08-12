import { describe, expect, it } from 'vitest';

import { toFormDefaults, toPayload } from '@/components/admin/dynamic-fields';
import type { FieldConfig } from '@/lib/admin-config';

const fields: FieldConfig[] = [
  { name: 'fullName', label: 'Full name', type: 'text' },
  { name: 'profileImageId', label: 'Profile image media ID', type: 'text' },
  { name: 'rotatingTitles', label: 'Rotating titles', type: 'tags' },
  {
    name: 'publicationStatus',
    label: 'Publication status',
    type: 'select',
    options: [{ label: 'Published', value: 'published' }],
  },
];

describe('admin dynamic field helpers', () => {
  it('serializes object-like ids into stable string defaults for text inputs', () => {
    const defaults = toFormDefaults(fields, {
      fullName: 'Ankita Singh',
      profileImageId: {
        toString: () => '689b0a10d4ce4de2b5d97234',
      },
      rotatingTitles: ['Research Analyst', 'Pharmacy Graduate'],
      publicationStatus: 'published',
    });

    expect(defaults).toEqual({
      fullName: 'Ankita Singh',
      profileImageId: '689b0a10d4ce4de2b5d97234',
      rotatingTitles: 'Research Analyst, Pharmacy Graduate',
      publicationStatus: 'published',
    });
  });

  it('builds a clean API payload from form values', () => {
    const payload = toPayload(fields, {
      fullName: 'Ankita Singh',
      profileImageId: '689b0a10d4ce4de2b5d97234',
      rotatingTitles: 'Research Analyst, Pharmacy Graduate',
      publicationStatus: 'published',
    });

    expect(payload).toEqual({
      fullName: 'Ankita Singh',
      profileImageId: '689b0a10d4ce4de2b5d97234',
      rotatingTitles: ['Research Analyst', 'Pharmacy Graduate'],
      publicationStatus: 'published',
    });
  });
});
