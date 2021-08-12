import { GenerateConfigurationsColumns } from 'typings/interfaces';
import config from 'configs/datatransfer.config';
import { DataTransfersTableData } from 'pages/DataTransfers/types';
import { getMappedColumnName } from 'utils/columns';

/**
 * Generate the desired columns with correctly mapped names and
 * ability to sort (based on config).
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

  columnNames.forEach((key) => {
    if (!config.ignoreColumns.includes(key)) {
      const [name, parent] = key.split('.').reverse();

      let title = getMappedColumnName(name, 'datatransfers');

      // Note: This might be removed in favour of adding a "subtitle" property to cogs.js table column header
      if (parent) {
        title += ` (${parent})`;
      }

      results.push({
        title,
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
