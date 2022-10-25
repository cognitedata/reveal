import { Table, TableNoResults } from '@cognite/cdf-utilities';
import { getContainer, ContentView } from 'utils';
import { useTranslation } from 'common/i18n';
import { useResourceTableColumns } from 'components/Data/ResourceTableColumns';
import { Asset } from '@cognite/sdk';

interface AssetsTableProps {
  isLoading: boolean;
  data: Asset[] | undefined;
}

const AssetsTable = ({ data = [], isLoading }: AssetsTableProps) => {
  const { t } = useTranslation();
  const resourceTableColumns = useResourceTableColumns<Asset>('assets');

  return (
    <ContentView id="assetsTableId">
      <Table
        rowKey="key"
        loading={isLoading}
        columns={resourceTableColumns}
        dataSource={data}
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
