import { CdfApplicationUsage } from './CdfApplicationUsage';
import { CdfResourceUsage } from './CdfResourceUsage';

export type CdfUserHistoryStorage = {
  editedResources: CdfResourceUsage[];
  viewedResources: CdfResourceUsage[];
  usedApplications: CdfApplicationUsage[];
};
