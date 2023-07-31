import { ExtendedConfigurationsResponse } from 'typings/interfaces';

export function getProgressStats(
  record: ExtendedConfigurationsResponse,
  key: string
) {
  return record.progress[key]?.total || 0;
}
