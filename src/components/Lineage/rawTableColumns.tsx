import React from 'react';
import { getStringCdfEnv } from 'utils/utils';
import sdk from '@cognite/cdf-sdk-singleton';
import { RawWithUpdateTime } from 'components/Lineage/Lineage';
import { RawIntegrationWithUpdateTime } from 'components/Lineage/Integration/IntegrationRawTables';
import { IntegrationLink } from 'components/Lineage/Integration/IntegrationLink';
import { LabelTagGrey, NoStyleList } from 'utils/styledComponents';

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

export const rawTablesColumnsWithIntegration = () => {
  return [
    {
      title: 'Database name',
      key: 'databaseName',
      render: (row: RawIntegrationWithUpdateTime) => (
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
      sorter: (
        a: RawIntegrationWithUpdateTime,
        b: RawIntegrationWithUpdateTime
      ) => {
        return a.databaseName.localeCompare(b.databaseName);
      },
    },
    {
      title: 'Table name',
      key: 'tableName',
      render: (row: RawIntegrationWithUpdateTime) => (
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
      sorter: (
        a: RawIntegrationWithUpdateTime,
        b: RawIntegrationWithUpdateTime
      ) => a.tableName.localeCompare(b.tableName),
    },
    {
      title: 'Connected extraction pipeline',
      key: 'integration',
      render: (row: RawIntegrationWithUpdateTime) => {
        const { integrations } = row;
        if (!integrations || integrations.length === 0) {
          return <LabelTagGrey>Not connected/defined</LabelTagGrey>;
        }
        return (
          <NoStyleList>
            {integrations.map((integration) => {
              return (
                <li key={integration.id}>
                  <IntegrationLink integration={integration} />
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
