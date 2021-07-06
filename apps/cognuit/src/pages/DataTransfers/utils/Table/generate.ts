import { GenerateConfigurationsColumns } from 'typings/interfaces';
import config from 'configs/datatransfer.config';
import { DataTransfersTableData } from 'pages/DataTransfers/types';
import { getMappedColumnName } from 'utils/columns';

/**
 * Generate the desired columns with correctly mapped names and
 * ability to sort (based on config). Additionally, regardlessly add the
 * {@link DetailViewButton} to all rows.
 *
 * @param response (almost) API response
 * @param columnNames All the desired/selected columns
 */
export function generatesDataTypesColumnsFromData(
  response: DataTransfersTableData[],
  columnNames: string[]
): GenerateConfigurationsColumns[] | undefined {
  const results: GenerateConfigurationsColumns[] = [];

  if (response.length === 0) return undefined;

  Object.keys(response[0]).forEach((key) => {
    if (
      (columnNames.length === 0 || columnNames.includes(key)) &&
      !config.ignoreColumns.includes(key)
    ) {
      results.push({
        title: getMappedColumnName(key, 'datatransfers'),
        dataIndex: key, // mark for delete
        key,
        sorter: !!config.nonSortableColumns.includes(key), // Rename property
      });
    }
  });

  results.push({
    title: '',
    dataIndex: 'detailViewButton', // mark for delete
    key: 'detailViewButton',
    sorter: true, // Rename property
  });

  return results;
}
