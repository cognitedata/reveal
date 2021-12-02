import { mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';

type ConfigSchema = {
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
    join(dir, 'cdfrc.json'),
    JSON.stringify(config, undefined, 2)
  );
};
