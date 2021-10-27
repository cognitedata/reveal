import fs from 'fs';
import path from 'path';

import { CustomActionFunction } from 'node-plop';

import { AddLibraryActionConfig } from '../types';

type LibraryAction = (base: string) => void;
type PossibleActions = 'cypress' | 'testcafe' | 'none';

const removeFilesFromFolder = (folder: string, filesToRemove: string): void => {
  // eslint-disable-next-line no-console
  console.log(`Removing ${filesToRemove} from ${folder}`);
  const dirFiles = fs.readdirSync(folder);
  dirFiles.forEach((file) => {
    if (file.includes(filesToRemove)) {
      fs.rmSync(path.join(folder, file));
    }
  });
};

const removeFromPackage = (file: string, commandToRemove: string): void => {
  // eslint-disable-next-line no-console
  console.log(`Removing ${commandToRemove} from ${file}`);
  const fileContent = fs.readFileSync(file).toString();
  const json = JSON.parse(fileContent);
  Object.keys(json.scripts).forEach((script: string) => {
    if (script.includes(commandToRemove)) {
      delete json.scripts[script];
    }
  });
  fs.writeFileSync(file, JSON.stringify(json));
};

const removeFromBazel = (file: string, commandToRemove: string): void => {
  // eslint-disable-next-line no-console
  console.log(`Removing ${commandToRemove} from ${file}`);
  let bazelContent = fs.readFileSync(file).toString();

  const whitespace = '[^\\S\\r\\n]+';
  const re = new RegExp(
    `\n###${whitespace}${commandToRemove}${whitespace}###` +
      `[\\s\\S]+` +
      `###${whitespace}${commandToRemove}${whitespace}End${whitespace}###\n`,
    'gim'
  );
  bazelContent = bazelContent.replace(re, '');
  fs.writeFileSync(file, bazelContent);
};

const cypressAction: LibraryAction = (base) => {
  fs.rmdirSync(path.join(base, 'testcafe'), { recursive: true });

  removeFilesFromFolder(path.join(base, 'scripts'), 'testcafe-');
  removeFromPackage(path.join(base, 'package.json'), 'testcafe');
  removeFromBazel(path.join(base, 'BUILD.bazel'), 'testcafe');
  fs.rmSync(path.join(base, 'tsconfig.testcafe.json'));
  fs.rmSync(path.join(base, '.testcaferc.json'));
};

const testcafeAction: LibraryAction = (base) => {
  fs.rmdirSync(path.join(base, 'cypress'), { recursive: true });

  removeFilesFromFolder(path.join(base, 'scripts'), 'cypress-');
  removeFromPackage(path.join(base, 'package.json'), 'cypress');
  removeFromBazel(path.join(base, 'BUILD.bazel'), 'cypress');
  fs.rmSync(path.join(base, 'cypress.json'));
};

const everyActions: LibraryAction = (base) => {
  cypressAction(base);
  testcafeAction(base);

  removeFromBazel(path.join(base, 'BUILD.bazel'), 'E2E tests');
  fs.rmdirSync(path.join(base, 'private-keys'), { recursive: true });
};

const libraryActions: Record<string, LibraryAction> = {
  cypress: cypressAction,
  testcafe: testcafeAction,
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
