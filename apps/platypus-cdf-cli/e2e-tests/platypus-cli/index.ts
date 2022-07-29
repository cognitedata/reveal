import { CONSTANTS } from '@cognite/platypus-cdf-cli/app/constants';
import { Run } from './process';

const runCommand = async (...args) => {
  return await Run(CONSTANTS.APP_ID, ...args);
};

export async function dataModelsPublish(
  externalId: string,
  file: string,
  allowBreakingChange = false
) {
  return await runCommand(
    'data-models',
    'publish',
    '--external-id',
    externalId,
    '--file',
    file,
    '--allow-breaking-change',
    allowBreakingChange
  );
}

export async function dataModelsCreate(
  name: string,
  externalId?: string,
  dataSetId?: string
) {
  const args = ['data-models', 'create', name];

  if (externalId) {
    args.push('--external-id', externalId);
  }
  if (dataSetId) {
    args.push('--data-set-id', dataSetId);
  }

  return await runCommand(...args);
}

export async function dataModelsDelete(externalId: string) {
  return await runCommand('data-models', 'delete', '--external-id', externalId);
}

export function login() {
  return runCommand(
    'login',
    process.env.PROJECT,
    '--cluster',
    process.env.CLUSTER,
    '--tenant',
    process.env.TENANT,
    '--client-id',
    process.env.CLIENT_ID,
    '--client-secret',
    process.env.CLIENT_SECRET
  );
}

export async function logout() {
  return runCommand('logout');
}
