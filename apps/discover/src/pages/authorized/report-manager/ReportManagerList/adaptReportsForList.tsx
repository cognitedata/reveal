import { Report } from 'domain/reportManager/internal/types';

import { UMSUser } from '@cognite/user-management-service-types';

import { getLookupTableOfWells } from './getLookupTableOfWells';
import { TableReport } from './types';

const transformReportForDisplay = (report: Report, user?: UMSUser) => {
  return {
    ...report,
    externalId: report.reportType,
    ownerUserId: user && user.displayName ? user.displayName : 'Loading...',
  };
};

export const adaptReportsForList = async ({
  reports,
  users,
}: {
  reports?: Report[];
  users?: UMSUser[];
}): Promise<TableReport[]> => {
  if (!reports) {
    return [];
  }

  const wellDataById = await getLookupTableOfWells(reports);

  const processedData = reports.reduce((results, row) => {
    const well = wellDataById[row.externalId];

    if (!well) {
      console.error('Cannot find well for this report:', row);
      return results;
    }

    const user = users?.find((user) => {
      return user.id === row.ownerUserId;
    });

    const existingWellboreResult = results.find(
      (item) => item.externalId === well.name
    );

    // add onto existing well group
    if (existingWellboreResult) {
      if (!existingWellboreResult.subRows) {
        existingWellboreResult.subRows = [];
      }
      existingWellboreResult.subRows.push(transformReportForDisplay(row, user));
      return results;
    }

    // or start a new group for this well
    return [
      ...results,
      {
        externalId: well.name,
        subRows: [transformReportForDisplay(row, user)],
      },
    ];
  }, [] as TableReport[]);

  return processedData;
};
