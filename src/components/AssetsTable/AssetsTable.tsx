import { Table, TableNoResults } from '@cognite/cdf-utilities';
import { ContentView, getContainer, handleError } from 'utils';
import { useSearchResource } from 'hooks/useSearchResource';
import { useTranslation } from 'common/i18n';
import { useResourceTableColumns } from 'components/Data/ResourceTableColumns';

interface assetsTableProps {
  dataSetId: number;
  query: string;
}

const AssetsTable = ({ dataSetId, query }: assetsTableProps) => {
  const { t } = useTranslation();
  const { getResourceTableColumns } = useResourceTableColumns();
  const { data: assets, isLoading: isAssetsLoading } = useSearchResource(
    'assets',
    dataSetId,
    query,
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
