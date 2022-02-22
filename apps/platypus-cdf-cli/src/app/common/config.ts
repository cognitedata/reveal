import { promises } from 'fs';
const { stat, writeFile } = promises;
import { join } from 'path';
import { Arguments, CommandModule } from 'yargs';
import ConfigStore from 'configstore';
import { CONSTANTS } from '../constants';
import { BaseArgs, CLIConfigManager } from '../types';
import { CLICommand } from './cli-command';
import { cwd } from 'process';
import { DEBUG as _DEBUG } from '../utils/logger';
import { getProjectConfig } from '../utils/config';

const DEBUG = _DEBUG.extend('common:config');

export function injectRCFile() {
  return function (
    target: CommandModule | CLICommand,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    if (
      propertyKey === target.handler.name ||
      propertyKey === (target as CLICommand).execute.name
    ) {
      const original = descriptor.value;
      descriptor.value = async function (...args) {
        const arg = args[0] as Arguments<BaseArgs>;

        if (
          (await stat(join(cwd(), CONSTANTS.PROJECT_CONFIG_FILE_NAME))).isFile()
        ) {
          arg.solutionConfig = new SolutionConfigManager();
          original.apply(this, args);
        }
      };
    }
    return descriptor;
  };
}

export const makeCDFRCFile = async (
  externalId: string,
  backend: string,
  projectVersion: string
) => {
  DEBUG('Fetching global app/login config');
  const projectConfig = getProjectConfig();
  if (!projectConfig) {
    throw new Error('Failed to load global config');
  }

  DEBUG('App/login config loaded %o', projectConfig);

  const { cluster, project } = projectConfig;

  DEBUG('Creating project config file');

  await writeFile(
    join(cwd(), CONSTANTS.PROJECT_CONFIG_FILE_NAME),
    JSON.stringify(
      {
        version: 1,
        name: externalId,
        config: {
          backend,
          cluster,
          project,
          templateId: externalId,
          templateVersion: parseInt(projectVersion || '0'),
        },
      },
      undefined,
      2
    )
  );
};
class SolutionConfigManager<T> implements CLIConfigManager<T> {
  private readonly store: ConfigStore;
  all: T;

  constructor() {
    this.store = new ConfigStore(
      CONSTANTS.PROJECT_CONFIG_FILE_NAME,
      {},
      { configPath: join(cwd(), CONSTANTS.PROJECT_CONFIG_FILE_NAME) }
    );

    if (Object.keys(this.store.all).length == 0) {
      throw new Error(
        `Either config file is empty or invalid, please delete it and run the init command again`
      );
    }
    this.all = this.store.all;
  }

  get(key: string): T[keyof T] {
    return this.store.get(key);
  }

  set(key: string, value: unknown): void {
    return this.store.set(key, value);
  }

  delete(key: keyof T): void {
    return this.store.delete(key as string);
  }

  clear(): void {
    return this.store.clear();
  }
}
