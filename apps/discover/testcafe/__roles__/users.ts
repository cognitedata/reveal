import { screen } from '@testing-library/testcafe';
import { Role } from 'testcafe';

import { progress } from '../utils';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

export const regularUser = Role(
  baseUrl,
  async (t) => {
    progress('Attempting to perform fake IDP login');
    const loginButton = screen.getByText(
      'Login with Fake IDP (Bluefield User)'
    );
    await t.click(loginButton);
    await t.click(screen.getByText('Accept'));
  },
  { preserveUrl: true }
);

export const adminUser = Role(
  baseUrl,
  async (t) => {
    progress('Attempting to perform fake IDP login');
    const loginButton = screen.getByText(
      'Login with Fake IDP (Bluefield Admin)'
    );
    await t.click(loginButton);
    await t.click(screen.getByText('Accept'));
  },
  { preserveUrl: true }
);
