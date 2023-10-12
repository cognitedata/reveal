import { TableNoResults } from '@cognite/cdf-utilities';
import { Icon, Table } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';

import { useTranslation } from '../../common/i18n';
import { ContentView } from '../../utils';
import { useResourceTableColumns } from '../Data/ResourceTableColumns';

interface AssetsTableProps {
  isLoading: boolean;
  data: Asset[] | undefined;
}

const AssetsTable = ({ data = [], isLoading }: AssetsTableProps) => {
  const { t } = useTranslation();
  const { assetColumns } = useResourceTableColumns();

  return (
    <ContentView id="assetsTableId" className="resource-table">
      {isLoading ? (
        <div className="loader-wrapper">
          <Icon type="Loader" size={32} />
        </div>
      ) : (
        <Table
          rowKey={(d) => String(d.id)}
          // The types are interfaces instead of type, can't get them to work
          // with the types defined in the library. The components worked and
          // still work fine, therefore I think it's safe to provide any.
          columns={assetColumns as any}
          dataSource={data as any}
          locale={{
            emptyText: (
              <TableNoResults
                title={t('no-records')}
                content={t('no-search-records', {
                  $: '',
                })}
              />
            ),
          }}
        />
      )}
    </ContentView>
  );
};

export default AssetsTable;
