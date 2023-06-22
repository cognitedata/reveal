import { celaneseConfig } from './Celanese';
import { cogniteConfig } from './Cognite';
import { ProjectConfig } from './types';

export const customerConfig: ProjectConfig[] = [
  ...celaneseConfig,
  ...cogniteConfig,
];
