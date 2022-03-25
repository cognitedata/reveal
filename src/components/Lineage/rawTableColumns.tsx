import React from 'react';
import { getStringCdfEnv } from 'utils/shared';
import sdk from '@cognite/cdf-sdk-singleton';
import { RawWithUpdateTime } from 'components/Lineage/Lineage';
import { RawExtpipeWithUpdateTime } from 'components/Lineage/Extpipe/ExtpipeRawTables';
import { ExtpipeLink } from 'components/Lineage/Extpipe/ExtpipeLink';
import { NoStyleList } from 'utils/styledComponents';

export const rawTablesColumns = [
  {
    title: 'Database name',
    key: 'databaseName',
    render: (row: RawWithUpdateTime) => (
      <a
        href={`/${sdk.project}/raw/${row.databaseName}${
          getStringCdfEnv() ? `?env=${getStringCdfEnv()}` : ''
        }`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {row.databaseName}
      </a>
    ),
  },
  {
    title: 'Table name',
    key: 'tableName',
    render: (row: RawWithUpdateTime) => (
      <a
        href={`/${sdk.project}/raw/${row.databaseName}/${row.tableName}${
          getStringCdfEnv() ? `?env=${getStringCdfEnv()}` : ''
        }`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {row.tableName}
      </a>
    ),
  },
  {
    title: 'Last update time',
    dataIndex: 'lastUpdate',
    key: 'lastUpdateTime',
  },
];

export const rawTablesColumnsWithExtpipe = () => {
  return [
    {
      title: 'Database name',
      key: 'databaseName',
      render: (row: RawExtpipeWithUpdateTime) => (
        <a
          href={`/${sdk.project}/raw/${row.databaseName}${
            getStringCdfEnv() ? `?env=${getStringCdfEnv()}` : ''
          }`}
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
      title: 'Table name',
      key: 'tableName',
      render: (row: RawExtpipeWithUpdateTime) => (
        <a
          href={`/${sdk.project}/raw/${row.databaseName}/${row.tableName}${
            getStringCdfEnv() ? `?env=${getStringCdfEnv()}` : ''
          }`}
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
      title: 'Populated by extraction pipeline',
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
    {
      title: 'Last update time',
      dataIndex: 'lastUpdate',
      key: 'lastUpdateTime',
    },
  ];
};
