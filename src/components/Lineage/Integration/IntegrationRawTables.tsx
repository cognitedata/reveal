import React, {
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';
import Table from 'antd/lib/table';
import Timeline from 'antd/lib/timeline';
import {
  LineageDot,
  LineageSubTitle,
  LineageTitle,
} from 'utils/styledComponents';
import { rawTablesColumnsWithIntegration } from 'components/Lineage/rawTableColumns';
import { Integration, RawTable } from 'utils/types';
import { DataSetWithIntegrations } from 'actions';
import { getContainer } from 'utils/utils';
import {
  combineDataSetAndIntegrationsRawTables,
  updateRawTableWithLastUpdate,
} from 'components/Lineage/Integration/rawTablesUtils';

export interface RawIntegrationWithUpdateTime extends RawTable {
  lastUpdate: string;
  integrations: Integration[];
}

interface IntegrationRawTablesProps {
  dataSet?: DataSetWithIntegrations;
}

export const IntegrationRawTables: FunctionComponent<IntegrationRawTablesProps> =
  ({ dataSet }: PropsWithChildren<IntegrationRawTablesProps>) => {
    const [rawList, setRawList] = useState<RawIntegrationWithUpdateTime[]>([]);
    const [loadingRaw, setLoadingRaw] = useState<boolean>(true);

    const getRawTableIntegrationLastUpdateTime = useCallback(async () => {
      const combinedRaws =
        dataSet != null ? combineDataSetAndIntegrationsRawTables(dataSet) : [];
      const rawTables = await Promise.all(
        combinedRaws.map(updateRawTableWithLastUpdate)
      );
      setRawList(rawTables);
      setLoadingRaw(false);
    }, [dataSet]);

    useEffect(() => {
      getRawTableIntegrationLastUpdateTime();
    }, [getRawTableIntegrationLastUpdateTime]);

    return (
      <Timeline.Item dot={<LineageDot />}>
        <LineageTitle>Raw Tables</LineageTitle>
        <LineageSubTitle>
          The RAW tables below are used in this data integration.
        </LineageSubTitle>

        <Table
          loading={loadingRaw}
          columns={rawTablesColumnsWithIntegration()}
          dataSource={rawList}
          pagination={{ pageSize: 5 }}
          rowKey={(record: RawIntegrationWithUpdateTime) =>
            `${record.databaseName}/${record.tableName}`
          }
          getPopupContainer={getContainer}
        />
      </Timeline.Item>
    );
  };
