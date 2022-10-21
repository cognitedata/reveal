import { Wellbore } from '@cognite/sdk-wells/dist/src';

import { Report } from '../types';

export const normalizeReports = (
  reports: Report[],
  wellbores: Wellbore[]
): Report[] => {
  const wellboreList = wellbores.reduce((list, current) => {
    return { ...list, [current.matchingId]: current.name };
  }, {} as { [key: string]: string });

  return reports.map((report) => {
    return { ...report, wellboreName: wellboreList[report.externalId] };
  });
};
