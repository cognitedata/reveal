import { Role } from 'testcafe';
import { screen } from '@testing-library/testcafe';

import { log } from '../utils';

export const regularUser = Role(
  process.env.BASE_URL,
  async (t) => {
    log('Attempting to perform login');
    const loginInput = screen.getByPlaceholderText('Enter Company ID');
    await t.typeText(loginInput, 'fusion');
    const loginButton = screen.getByText('Continue');
    await t.click(loginButton);
  },
  { preserveUrl: true }
);
