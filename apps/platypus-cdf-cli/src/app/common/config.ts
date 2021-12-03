import { mkdirSync, promises } from 'fs';
const { writeFile, readFile } = promises;

import { join } from 'path';
import { Arguments, CommandModule } from 'yargs';
import { CONSTANTS } from '../constants';
import { BaseArgs } from '../types';

export type ConfigSchema = {
  version: number;
  name: string;
  config: {
    templateId: string;
    templateVersion: string;
    schemaFile: string;
    project: string;
    cluster: string;
    [key: string]: unknown;
  };
};

export const makeFolderAndCreateConfig = async (
  dir: string,
  config: ConfigSchema
) => {
  mkdirSync(dir);
  await writeFile(
    join(dir, CONSTANTS.PROJECT_CONFIG_FILE_NAME),
    JSON.stringify(config, undefined, 2)
  );
};

export function injectRCFile() {
  return function (
    target: CommandModule,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    if (propertyKey === target.handler.name) {
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
