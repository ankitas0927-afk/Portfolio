import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { ContactForm } from '@/components/forms/contact-form';

describe('ContactForm', () => {
  it('validates required fields before submit', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn());

    render(<ContactForm />);

    await user.click(screen.getByRole('button', { name: /Send Message/i }));

    await waitFor(() => {
      expect(screen.getByText(/Please enter your name/i)).toBeInTheDocument();
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    });
  });
});
