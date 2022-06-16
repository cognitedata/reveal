import { CONSTANTS } from '@cognite/platypus-cdf-cli/app/constants';
import { Run } from './utils';

describe('E2E for Templates Generate', () => {
  beforeAll(async () => {
    await Run(CONSTANTS.APP_ID, 'logout');
    const response = await Run(
      CONSTANTS.APP_ID,
      'login',
      'david',
      '--auth-type',
      'clientSecret',
      '--cluster',
      process.env.CLUSTER,
      '--tenant',
      process.env.TENANT,
      '--client-id',
      process.env.CLIENT_ID,
      '--client-secret',
      process.env.CLIENT_SECRET
    );
    expect(response).toMatch('Login Success');
  });

  it('Should run tests', () => {
    expect(true).toEqual(true);
  });
});
