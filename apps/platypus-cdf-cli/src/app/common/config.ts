import { promises } from 'fs';
const { stat } = promises;
import { join } from 'path';
import { Arguments, CommandModule } from 'yargs';
import ConfigStore from 'configstore';
import { CONSTANTS } from '../constants';
import { BaseArgs, CLIConfigManager } from '../types';
import { CLICommand } from './cli-command';
import { cwd } from 'process';

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

  get(key: keyof T): T[keyof T] {
    return this.store.get(key as string);
  }

  set(key: keyof T, value: T[keyof T]): void {
    return this.store.set(key as string, value);
  }

  delete(key: keyof T): void {
    return this.store.delete(key as string);
  }

  clear(): void {
    return this.store.clear();
  }
}
