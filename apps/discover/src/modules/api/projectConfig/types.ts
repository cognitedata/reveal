import { ProjectConfig } from '@cognite/discover-api-types';

import { BaseAPIResult } from '../types';

export interface ProjectConfigResult extends BaseAPIResult {
  data: ProjectConfig;
}
