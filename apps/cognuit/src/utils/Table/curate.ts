import { TableProps } from '@cognite/cogs.js';
import isUndefined from 'lodash/isUndefined';
import { GenerateConfigurationsColumns, Rule } from 'typings/interfaces';
import { reportException } from '@cognite/react-errors';

/**
 * Curate the columns to match the defined rules together with the accessible columns,
 * to a format that is specific to Cogs.js table (React Table).
 *
 * @param columns All the transformed columns from {@link generatesDataTypesColumnsFromData} / {@link generateConfigurationsColumnsFromData}
 * @param rules All the defined rules from {@link dataTransfersColumnRules} / {@link columnRules}
 */
export function curateTableColumns<T extends { id: number }>(
  columns: GenerateConfigurationsColumns[] | undefined,
  rules: Rule[]
): TableProps<T>['columns'] {
  if (isUndefined(columns)) {
    return [];
  }

  const curatedColumns = columns.map((column) => {
    const rule = rules.find(
      (rule: Rule) => rule.key === column.key || rule.key === '*'
    );

    if (!rule) {
      reportException(new Error(`Did not find rule for ${column}`));
    }

    const curateColumns = {
      Header: column.title,
      accessor: column.key,
      Cell: rule?.render,
      disableSortBy: column.sorter,
    } as TableProps<T>['columns'][number];

    if (rule?.width) {
      curateColumns.width = rule.width;
    }

    if (rule?.Filter && rule?.filter) {
      curateColumns.Filter = rule.Filter;
      curateColumns.filter = rule.filter;
    }

    return curateColumns;
  });

  return curatedColumns;
}
