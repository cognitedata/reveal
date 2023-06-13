import { FunctionComponent, PropsWithChildren } from 'react';

import { DataSetWithExtpipes } from '@data-catalog-app/actions';
import { getRawTableExtpipeLastUpdateTimeKey } from '@data-catalog-app/actions/keys';
import { useTranslation } from '@data-catalog-app/common/i18n';
import {
  combineDataSetAndExtpipesRawTables,
  updateRawTableWithLastUpdate,
} from '@data-catalog-app/components/Lineage/Extpipe/rawTablesUtils';
import { useRawTableColumns } from '@data-catalog-app/components/Lineage/rawTableColumns';
import {
  LineageSection,
  LineageSubTitle,
  LineageTitle,
} from '@data-catalog-app/utils/styledComponents';
import { Extpipe, RawTable } from '@data-catalog-app/utils/types';
import { useQuery } from '@tanstack/react-query';

import { Icon, Table } from '@cognite/cogs.js';

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

  const { data: rawList } = useQuery(getRawTableExtpipeLastUpdateTimeKey(), {
    queryFn: async () => {
      const combinedRaws =
        dataSet != null ? combineDataSetAndExtpipesRawTables(dataSet) : [];
      const rawTables = await Promise.all(
        combinedRaws.map((raw) => updateRawTableWithLastUpdate(raw, t))
      );
      return rawTables;
    },
  });

  return (
    <LineageSection>
      <LineageTitle>
        {t('raw-table_other', { postProcess: 'uppercase' })}
      </LineageTitle>
      <LineageSubTitle>{t('extpipe-raw-tables-title')}</LineageSubTitle>
      {isExtpipesFetched && rawList ? (
        <div className="resource-table">
          <Table
            columns={rawTablesColumnsWithExtpipe() as any}
            dataSource={rawList}
            pageSize={5}
            rowKey={(record: RawExtpipeWithUpdateTime) =>
              `${record.databaseName}/${record.tableName}`
            }
          />
        </div>
      ) : (
        <Icon type="Loader" />
      )}
    </LineageSection>
  );
};
