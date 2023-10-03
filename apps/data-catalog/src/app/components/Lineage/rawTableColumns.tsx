import { createLink } from '@cognite/cdf-utilities';

import { useTranslation } from '../../common/i18n';
import { CogsTableCellRenderer, NoStyleList } from '../../utils';

import { ExtpipeLink } from './Extpipe/ExtpipeLink';
import { RawExtpipeWithUpdateTime } from './Extpipe/ExtpipeRawTables';
import { RawWithUpdateTime } from './Lineage';

export const useRawTableColumns = () => {
  const { t } = useTranslation();

  const rawTablesColumns = [
    {
      Header: t('lineage-raw-table-column-databaseName'),
      id: 'databaseName',
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<RawWithUpdateTime>) => (
        <a
          href={createLink(`/raw`, {
            activeTable: `["${record.databaseName}","${record.tableName}",null]`,
            tabs: `[["${record.databaseName}","${record.tableName}",null]]`,
          })}
          target="_blank"
          rel="noopener noreferrer"
        >
          {record.databaseName}
        </a>
      ),
      sorter: (a: RawExtpipeWithUpdateTime, b: RawExtpipeWithUpdateTime) => {
        return a.databaseName.localeCompare(b.databaseName);
      },
    },
    {
      Header: t('lineage-raw-table-column-tableName'),
      id: 'tableName',
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<RawWithUpdateTime>) => (
        <a
          href={createLink(`/raw`, {
            activeTable: `["${record.databaseName}","${record.tableName}",null]`,
            tabs: `[["${record.databaseName}","${record.tableName}",null]]`,
          })}
          target="_blank"
          rel="noopener noreferrer"
        >
          {record.tableName}
        </a>
      ),
      sorter: (a: RawExtpipeWithUpdateTime, b: RawExtpipeWithUpdateTime) =>
        a.tableName.localeCompare(b.tableName),
    },
    {
      Header: t('lineage-raw-table-column-lastUpdate'),
      accessor: 'lastUpdate',
      id: 'lastUpdateTime',
      disableSortBy: true,
    },
  ];

  const rawTablesColumnsWithExtpipe = () => {
    return [
      ...rawTablesColumns.slice(0, 2),
      {
        Header: t('lineage-raw-table-column-extpipe'),
        id: 'extpipe',
        disableSortBy: true,
        Cell: ({
          row: { original: record },
        }: CogsTableCellRenderer<RawExtpipeWithUpdateTime>) => {
          const { extpipes } = record;
          if (!extpipes || extpipes.length === 0) {
            return '–';
          }
          return (
            <NoStyleList>
              {Array.isArray(extpipes) &&
                extpipes.map((extpipe) => {
                  return (
                    <li key={extpipe.id}>
                      <ExtpipeLink extpipe={extpipe} />
                    </li>
                  );
                })}
            </NoStyleList>
          );
        },
      },
      ...rawTablesColumns.slice(2, 3),
    ];
  };
  return { rawTablesColumns, rawTablesColumnsWithExtpipe };
};
