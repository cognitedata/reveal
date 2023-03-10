import {
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Icon, Table } from '@cognite/cogs.js';
import {
  LineageSection,
  LineageSubTitle,
  LineageTitle,
} from 'utils/styledComponents';
import { useRawTableColumns } from 'components/Lineage/rawTableColumns';
import { Extpipe, RawTable } from 'utils/types';
import { DataSetWithExtpipes } from 'actions';
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
  const { rawTablesColumnsWithExtpipe } = useRawTableColumns();
  const [rawList, setRawList] = useState<RawExtpipeWithUpdateTime[]>([]);
  const [loadingRaw, setLoadingRaw] = useState<boolean>(true);

  const getRawTableExtpipeLastUpdateTime = useCallback(async () => {
    const combinedRaws =
      dataSet != null ? combineDataSetAndExtpipesRawTables(dataSet) : [];
    const rawTables = await Promise.all(
      combinedRaws.map((raw) => updateRawTableWithLastUpdate(raw, t))
    );
    setRawList(rawTables);
    setLoadingRaw(false);
  }, [dataSet, t]);

  useEffect(() => {
    getRawTableExtpipeLastUpdateTime();
  }, [getRawTableExtpipeLastUpdateTime]);

  return (
    <LineageSection>
      <LineageTitle>
        {t('raw-table_other', { postProcess: 'uppercase' })}
      </LineageTitle>
      <LineageSubTitle>{t('extpipe-raw-tables-title')}</LineageSubTitle>
      {isExtpipesFetched ? (
        <Table
          columns={rawTablesColumnsWithExtpipe()}
          dataSource={rawList}
          pageSize={5}
          rowKey={(record: RawExtpipeWithUpdateTime) =>
            `${record.databaseName}/${record.tableName}`
          }
        />
      ) : (
        <Icon type="Loader" />
      )}
    </LineageSection>
  );
};
