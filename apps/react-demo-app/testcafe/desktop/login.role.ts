import { Role } from 'testcafe';
import { screen } from '@testing-library/testcafe';

import { log } from '../utils';

export const regularUser = Role(
  process.env.BASE_URL,
  async (t) => {
    log('Attempting to perform fake IDP login');
    const loginButton = screen.getByText(
      'Login with Fake IDP (react-demo-app-e2e-azure-dev)'
    );
    await t.click(loginButton);
  },
  { preserveUrl: true }
);
