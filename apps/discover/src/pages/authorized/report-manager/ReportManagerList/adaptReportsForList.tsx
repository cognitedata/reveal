import { Report } from 'domain/reportManager/internal/types';

import { getLookupTableOfWells } from './getLookupTableOfWells';
import { transformReportForDisplay } from './ReportManagerList';
import { TableReport } from './types';

export const adaptReportsForList = async ({
  reports,
}: {
  reports?: Report[];
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

    const existingWellboreResult = results.find(
      (item) => item.externalId === well.name
    );

    // add onto existing well group
    if (existingWellboreResult) {
      if (!existingWellboreResult.subRows) {
        existingWellboreResult.subRows = [];
      }
      existingWellboreResult.subRows.push(transformReportForDisplay(row));
      return results;
    }

    // or start a new group for this well
    return [
      ...results,
      {
        externalId: well.name,
        subRows: [transformReportForDisplay(row)],
      },
    ];
  }, [] as TableReport[]);

  return processedData;
};
