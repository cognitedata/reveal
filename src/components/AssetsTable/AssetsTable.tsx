import sdk from '@cognite/cdf-sdk-singleton';
import { Table, TableNoResults } from '@cognite/cdf-utilities';
import {
  getContainer,
  ContentView,
  handleError,
  getResourceSearchParams,
  getResourceSearchQueryKey,
  ExploreDataFilters,
} from 'utils';
import { useTranslation } from 'common/i18n';
import { useResourceTableColumns } from 'components/Data/ResourceTableColumns';
import { useQuery } from 'react-query';
import { Asset } from '@cognite/sdk';

interface assetsTableProps {
  dataSetId: number;
  query: string;
  filters: ExploreDataFilters;
}

const AssetsTable = ({ dataSetId, query, filters }: assetsTableProps) => {
  const { t } = useTranslation();
  const resourceTableColumns = useResourceTableColumns<Asset>('assets');
  const { data: assets, isLoading: isAssetsLoading } = useQuery(
    getResourceSearchQueryKey('assets', dataSetId, query, filters),
    () => sdk.assets.search(getResourceSearchParams(dataSetId, query, filters)),
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
        columns={resourceTableColumns}
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
