import { CONSTANTS } from '@cognite/platypus-cdf-cli/app/constants';
import { promises } from 'fs';
import { Run } from './utils';
const { unlink } = promises;
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
  it('Templates Init', async () => {
    try {
      await unlink(CONSTANTS.PROJECT_CONFIG_FILE_NAME);
    } catch (error) {
      //noop
    }

    const response = await Run(
      CONSTANTS.APP_ID,
      'init',
      '--no-interactive',
      '--backend',
      'templates',
      '--new-project',
      'false',
      '--external-id',
      'Car',
      '--project-version',
      '1'
    );
    expect(response).toMatch('Solution "Car" is successfully initialized!');
  });

  // Commented out for now because we have disabled the templates commands
  // We will need to re-create this test for schema service
  // it('Generate From Init Templates', async () => {
  //   const response = await Run(
  //     CONSTANTS.APP_ID,
  //     'templates',
  //     'generate',
  //     '--plugins',
  //     'typescript'
  //   );
  //   //todo: check if the file is created
  //   expect(response).toMatch('Types generated successfully');
  // });
});
