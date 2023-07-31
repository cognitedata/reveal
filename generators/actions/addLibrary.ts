import fs from 'fs';
import path from 'path';

import { CustomActionFunction } from 'node-plop';

import { AddLibraryActionConfig } from '../types';

import {
  removeFilesFromFolder,
  removeFromPackage,
  removeFromBazel,
} from './utils';

type LibraryAction = (base: string) => void;
type PossibleActions = 'cypress' | 'none';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const doNothing: LibraryAction = () => {};

const removeCypressAction: LibraryAction = (base) => {
  fs.rmdirSync(path.join(base, 'cypress'), { recursive: true });

  removeFilesFromFolder(path.join(base, 'scripts'), 'cypress-');
  removeFromPackage(path.join(base, 'package.json'), 'cypress');
  removeFromBazel(path.join(base, 'BUILD.bazel'), 'cypress');
  fs.rmSync(path.join(base, 'cypress.json'));
};

const everyActions: LibraryAction = (base) => {
  removeCypressAction(base);

  removeFromBazel(path.join(base, 'BUILD.bazel'), 'E2E tests');
  fs.rmdirSync(path.join(base, 'private-keys'), { recursive: true });
};

const libraryActions: Record<string, LibraryAction> = {
  cypress: doNothing,
  none: everyActions,
};

const addLibrary: CustomActionFunction = (answers, config, plop) => {
  if (!config || !plop) {
    return 'failed';
  }

  const typedConfig = config as AddLibraryActionConfig;
  const testLibrary = (answers as Record<string, string>)
    .testLibrary as PossibleActions;

  libraryActions[testLibrary](plop.renderString(typedConfig.base, answers));

  return 'success';
};

export default addLibrary;
