import { CONSTANTS } from '@cognite/platypus-cdf-cli/app/constants';

import { Run } from './process';

const runCommand = async (...args) => {
  try {
    return await Run(CONSTANTS.APP_ID, ...args);
  } catch (error) {
    console.log('Command failed with args', args);
  }
};

export async function dataModelsPublish(
  externalId: string,
  file: string,
  version: string,
  space: string
) {
  return await runCommand(
    'data-models',
    'publish',
    '--external-id',
    externalId,
    '--file',
    file,
    '--space',
    space,
    '--version',
    version,
    '--verbose'
  );
}

export async function dataModelsList() {
  return await runCommand('data-models', 'list');
}

export async function dataModelsCreate(
  name: string,
  externalId: string,
  space: string,
  description?: string
) {
  const args = ['data-models', 'create', name];

  args.push('--external-id', externalId);
  args.push('--space', space);
  args.push('--description', description);

  return await runCommand(...args, '--verbose');
}

export async function login() {
  return await runCommand(
    'login',
    process.env.PROJECT,
    '--cluster',
    process.env.CLUSTER,
    '--tenant',
    process.env.TENANT,
    '--client-id',
    process.env.CLIENT_ID,
    '--client-secret',
    process.env.CLIENT_SECRET,
    '--verbose'
  );
}

export async function logout() {
  return await runCommand('logout', '--verbose');
}
