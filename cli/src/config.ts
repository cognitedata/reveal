import { readFileSync } from 'fs';

export type Config = {
  apiKey: string;
  baseUrl: string;
};

export function silentlyReadConfigFile(): Partial<Config> {
  try {
    const readConfig = JSON.parse(readFileSync('.platypusrc').toString());
    return readConfig;
  } catch (ex) {
    return {};
  }
}
