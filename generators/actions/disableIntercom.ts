import fs from 'fs';
import path from 'path';

import { CustomActionFunction } from 'node-plop';

import { DisableIntercomActionConfig } from '../types';

const parseFiles = (appPath: string): void => {
  const publicSidecar = fs
    .readFileSync(path.join(appPath, 'public', 'sidecar.js'))
    .toString();
  fs.writeFileSync(
    path.join(appPath, 'public', 'sidecar.js'),
    publicSidecar.replace(/disableIntercom: false/g, 'disableIntercom: true')
  );

  const sidecarTs = fs
    .readFileSync(path.join(appPath, 'src', 'utils', 'sidecar.ts'))
    .toString();
  fs.writeFileSync(
    path.join(appPath, 'src', 'utils', 'sidecar.ts'),
    sidecarTs.replace(
      /intercomSettings: {[\s\S]+?},/g,
      'disableIntercom: true,'
    )
  );
};

const disableIntercom: CustomActionFunction = (answers, config, plop) => {
  if (!config || !plop) {
    return 'failed';
  }
  const typedConfig = config as DisableIntercomActionConfig;
  if (!fs.existsSync(plop.renderString(typedConfig.path, answers))) {
    return 'path does not exists';
  }
  if (typedConfig.skip) {
    const skip = typedConfig.skip(answers);
    if (skip) {
      return skip;
    }
  }
  parseFiles(plop.renderString(typedConfig.path, answers));

  return 'success';
};

export default disableIntercom;
