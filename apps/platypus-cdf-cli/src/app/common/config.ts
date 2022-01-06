import { promises } from 'fs';
const { readFile } = promises;

import { join } from 'path';
import { Arguments, CommandModule } from 'yargs';
import { CONSTANTS } from '../constants';
import { BaseArgs } from '../types';
import { CLICommand } from './cli-command';

export type ConfigSchema = {
  version: number;
  name: string;
  config: {
    templateId: string;
    templateVersion: number;
    project: string;
    cluster: string;
    [key: string]: unknown;
  };
};

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
        try {
          const file = await readFile(
            join(process.cwd(), CONSTANTS.PROJECT_CONFIG_FILE_NAME)
          );
          arg.solutionConfig = JSON.parse(file.toString());
          original.apply(this, args);
        } catch (error) {
          throw new Error(
            `Failed to load the config file "${CONSTANTS.PROJECT_CONFIG_FILE_NAME}" make sure there exist the file in the same directory where you're executing this command`
          );
        }
      };
    }
    return descriptor;
  };
}
