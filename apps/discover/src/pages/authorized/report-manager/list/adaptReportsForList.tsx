import { adaptReportToDisplayReport } from 'domain/reportManager/internal/adapters/adaptReportToDisplayReport';
import { Report, DisplayReport } from 'domain/reportManager/internal/types';

import { UMSUser } from '@cognite/user-management-service-types';

// import { getLookupTableOfWells } from './getLookupTableOfWells';
import { TableReport } from './types';

const transformReportForDisplay = (
  report: DisplayReport,
  user?: UMSUser
): DisplayReport => {
  return {
    ...report,
    externalId: report.reportType,
    wellboreName: report.reportType,
    ownerUserId: user && user.displayName ? user.displayName : '',
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

  const displayReport = reports.map(adaptReportToDisplayReport);

  // const wellDataById = await getLookupTableOfWells(displayReport);

  const processedData = displayReport.reduce((results, report) => {
    // const well = wellDataById[report.externalId];

    // if (!well) {
    //   console.error('Cannot find well for this report:', report);
    //   return results;
    // }

    const user = users?.find((user) => {
      return user.id === report.ownerUserId;
    });

    const existingWellboreResult = results.find(
      (item) => item.externalId === report.externalId
    );

    // add onto existing well group
    if (existingWellboreResult) {
      if (!existingWellboreResult.subRows) {
        existingWellboreResult.subRows = [];
      }
      existingWellboreResult.subRows.push(
        transformReportForDisplay(report, user)
      );
      return results;
    }

    // or start a new group for this well
    return [
      ...results,
      {
        externalId: report.externalId,
        wellboreName: report.wellboreName,
        subRows: [transformReportForDisplay(report, user)],
      },
    ];
  }, [] as TableReport[]);

  return processedData;
};
