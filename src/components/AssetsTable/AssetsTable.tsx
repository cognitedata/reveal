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
  const { assetColumns } = useResourceTableColumns();

  return (
    <ContentView id="assetsTableId">
      <Table
        rowKey="key"
        loading={isLoading}
        // The types are interfaces instead of type, can't get them to work
        // with the types defined in the library. The components worked and
        // still work fine, therefore I think it's safe to provide any.
        columns={assetColumns as any}
        dataSource={data as any}
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
