import path from 'path';

import { CustomActionFunction } from 'node-plop';

import { DisableExperimentalActionConfig } from '../types';

import { removeFromBazel } from './utils';

const removeActions = (basePath: string) => {
  removeFromBazel(path.join(basePath, 'BUILD.bazel'), 'FAS BUILD');
};

const generalAction: CustomActionFunction = (answers, config, plop) => {
  if (!config || !plop) {
    return 'failed';
  }
  const typedConfig = config as DisableExperimentalActionConfig;
  removeActions(plop.renderString(typedConfig.base, answers));

  // parseFiles(plop.renderString(typedConfig.path, answers));

  return 'success';
};

export default generalAction;
