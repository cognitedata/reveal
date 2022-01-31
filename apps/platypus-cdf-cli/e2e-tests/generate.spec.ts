import { CONSTANTS } from '@cognite/platypus-cdf-cli/app/constants';
import { promises } from 'fs';
import { Run } from './utils';
const { unlink } = promises;
describe('E2E for Templates Generate', () => {
  beforeAll(async () => {
    await Run('platypus', 'logout');
    const response = await Run(
      'platypus',
      'login',
      '--auth-type',
      'clientSecret',
      '--client-secret',
      process.env.CLIENT_SECRET
    );
    console.log(response);
    expect(response).toMatch('Login Success');
  });
  it('Templates Init', async () => {
    try {
      await unlink(CONSTANTS.PROJECT_CONFIG_FILE_NAME);
    } catch (error) {
      //noop
    }

    const response = await Run(
      'platypus',
      'templates',
      'init',
      '--template-group-id',
      'Deniska Rediska',
      '--template-version',
      '52'
    );
    expect(response).toMatch(
      'Solution "Deniska Rediska" is successfully initialized!'
    );
  });
  it('Generate From Init Templates', async () => {
    const response = await Run(
      'platypus',
      'templates',
      'generate',
      '--plugins',
      'typescript'
    );
    //todo: check if the file is created
    expect(response).toMatch('Types generated successfully');
  });
});
