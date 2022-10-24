import sdk from '@cognite/cdf-sdk-singleton';
import { Table, TableNoResults } from '@cognite/cdf-utilities';
import {
  getContainer,
  ContentView,
  handleError,
  getResourceSearchParams,
  getResourceSearchQueryKey,
} from 'utils';
import { useTranslation } from 'common/i18n';
import { useResourceTableColumns } from 'components/Data/ResourceTableColumns';
import { useQuery } from 'react-query';

interface assetsTableProps {
  dataSetId: number;
  query: string;
}

const AssetsTable = ({ dataSetId, query }: assetsTableProps) => {
  const { t } = useTranslation();
  const { getResourceTableColumns } = useResourceTableColumns();
  const { data: assets, isLoading: isAssetsLoading } = useQuery(
    getResourceSearchQueryKey('assets', dataSetId, query),
    () => sdk.assets.search(getResourceSearchParams(dataSetId, query)),
    {
      onError: (e: any) => {
        handleError({ message: t('assets-failed-to-fetch'), ...e });
      },
    }
  );

  return (
    <ContentView id="assetsTableId">
      <Table
        rowKey="key"
        loading={isAssetsLoading}
        columns={[...getResourceTableColumns('assets')]}
        dataSource={assets || []}
        onChange={(_pagination, _filters) => {
          // TODO: Implement sorting
        }}
        getPopupContainer={getContainer}
        emptyContent={
          <TableNoResults
            title={t('no-records')}
            content={t('no-search-records', {
              $: '',
            })}
          />
        }
        appendTooltipTo={getContainer()}
      />
    </ContentView>
  );
};

export default AssetsTable;
