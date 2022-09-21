import { RawWithUpdateTime } from 'components/Lineage/Lineage';
import { RawExtpipeWithUpdateTime } from 'components/Lineage/Extpipe/ExtpipeRawTables';
import { ExtpipeLink } from 'components/Lineage/Extpipe/ExtpipeLink';
import { NoStyleList } from 'utils/styledComponents';
import { useTranslation } from 'common/i18n';
import { createLink } from '@cognite/cdf-utilities';

export const useRawTableColumns = () => {
  const { t } = useTranslation();

  const rawTablesColumns = [
    {
      title: t('lineage-raw-table-column-databaseName'),
      key: 'databaseName',
      render: (row: RawWithUpdateTime) => (
        <a
          href={createLink(`/raw`, {
            activeTable: `["${row.databaseName}","${row.tableName}",null]`,
            tabs: `[["${row.databaseName}","${row.tableName}",null]]`,
          })}
          target="_blank"
          rel="noopener noreferrer"
        >
          {row.databaseName}
        </a>
      ),
      sorter: (a: RawExtpipeWithUpdateTime, b: RawExtpipeWithUpdateTime) => {
        return a.databaseName.localeCompare(b.databaseName);
      },
    },
    {
      title: t('lineage-raw-table-column-tableName'),
      key: 'tableName',
      render: (row: RawWithUpdateTime) => (
        <a
          href={createLink(`/raw`, {
            activeTable: `["${row.databaseName}","${row.tableName}",null]`,
            tabs: `[["${row.databaseName}","${row.tableName}",null]]`,
          })}
          target="_blank"
          rel="noopener noreferrer"
        >
          {row.tableName}
        </a>
      ),
      sorter: (a: RawExtpipeWithUpdateTime, b: RawExtpipeWithUpdateTime) =>
        a.tableName.localeCompare(b.tableName),
    },
    {
      title: t('lineage-raw-table-column-lastUpdate'),
      dataIndex: 'lastUpdate',
      key: 'lastUpdateTime',
    },
  ];

  const rawTablesColumnsWithExtpipe = () => {
    return [
      ...rawTablesColumns.slice(0, 2),
      {
        title: t('lineage-raw-table-column-extpipe'),
        key: 'extpipe',
        render: (row: RawExtpipeWithUpdateTime) => {
          const { extpipes } = row;
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
