import {
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Icon } from '@cognite/cogs.js';
import Table from 'antd/lib/table';
import Timeline from 'antd/lib/timeline';
import {
  LineageDot,
  LineageSubTitle,
  LineageTitle,
} from 'utils/styledComponents';
import { rawTablesColumnsWithExtpipe } from 'components/Lineage/rawTableColumns';
import { Extpipe, RawTable } from 'utils/types';
import { DataSetWithExtpipes } from 'actions';
import { getContainer } from 'utils/shared';
import {
  combineDataSetAndExtpipesRawTables,
  updateRawTableWithLastUpdate,
} from 'components/Lineage/Extpipe/rawTablesUtils';
import { useTranslation } from 'common/i18n';

export interface RawExtpipeWithUpdateTime extends RawTable {
  lastUpdate: string;
  extpipes: Extpipe[];
}

interface ExtpipeRawTablesProps {
  dataSet?: DataSetWithExtpipes;
  isExtpipesFetched?: boolean;
}

export const ExtpipeRawTables: FunctionComponent<ExtpipeRawTablesProps> = ({
  dataSet,
  isExtpipesFetched,
}: PropsWithChildren<ExtpipeRawTablesProps>) => {
  const { t } = useTranslation();
  const [rawList, setRawList] = useState<RawExtpipeWithUpdateTime[]>([]);
  const [loadingRaw, setLoadingRaw] = useState<boolean>(true);

  const getRawTableExtpipeLastUpdateTime = useCallback(async () => {
    const combinedRaws =
      dataSet != null ? combineDataSetAndExtpipesRawTables(dataSet) : [];
    const rawTables = await Promise.all(
      combinedRaws.map(updateRawTableWithLastUpdate)
    );
    setRawList(rawTables);
    setLoadingRaw(false);
  }, [dataSet]);

  useEffect(() => {
    getRawTableExtpipeLastUpdateTime();
  }, [getRawTableExtpipeLastUpdateTime]);

  return (
    <Timeline.Item dot={<LineageDot />}>
      <LineageTitle>{t('raw-table_other')}</LineageTitle>
      <LineageSubTitle>{t('extpipe-raw-tables-title')}</LineageSubTitle>
      {isExtpipesFetched ? (
        <Table
          loading={loadingRaw}
          columns={rawTablesColumnsWithExtpipe()}
          dataSource={rawList}
          pagination={{ pageSize: 5 }}
          rowKey={(record: RawExtpipeWithUpdateTime) =>
            `${record.databaseName}/${record.tableName}`
          }
          getPopupContainer={getContainer}
        />
      ) : (
        <Icon type="Loader" />
      )}
    </Timeline.Item>
  );
};
