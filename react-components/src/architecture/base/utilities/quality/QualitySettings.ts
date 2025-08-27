import type { CadModelBudget, PointCloudBudget, ResolutionOptions } from '@cognite/reveal';

export type QualitySettings = {
  cadBudget: CadModelBudget;
  pointCloudBudget: PointCloudBudget;
  resolutionOptions: ResolutionOptions;
};
