import { screen } from '@testing-library/testcafe';
import capitalize from 'lodash/capitalize';
import { Role } from 'testcafe';

import App from '../__pages__/App';
import { progress } from '../utils';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';

export const regularUser = Role(
  baseUrl,
  async (t) => {
    progress('Attempting to perform fake IDP login');
    const loginButton = screen.getByText(
      `Login with Fake IDP (${capitalize(App.cluster)} E2E User)`
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
      `Login with Fake IDP (${capitalize(App.cluster)} E2E Admin)`
    );
    await t.click(loginButton);
    await t.click(screen.getByText('Accept'));
  },
  { preserveUrl: true }
);
