import { RevisionLog3D } from './sdk/3dApiUtils';
import { OrganizedRevisionLog } from './types';

/**
 * Organizes revision logs array by category
 */
export const getOrganizedRevisionLogs = (
  logs: RevisionLog3D[]
): { [key: string]: OrganizedRevisionLog[] } => {
  return logs.reduce((prev, log) => {
    const { timestamp, type, info } = log;
    const [category, status] = type.split('/');
    if (!prev[category]) {
      // eslint-disable-next-line no-param-reassign
      prev[category] = [{ timestamp, type: status, info }];
    } else {
      prev[category].push({ timestamp, type: status, info });
    }
    return prev;
  }, {});
};
