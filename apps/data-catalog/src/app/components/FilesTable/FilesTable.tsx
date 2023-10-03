import { TableNoResults } from '@cognite/cdf-utilities';
import { Icon, Table } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';

import { useTranslation } from '../../common/i18n';
import { ContentView } from '../../utils';
import { useResourceTableColumns } from '../Data/ResourceTableColumns';

interface FilesTableProps {
  data: FileInfo[] | undefined;
  isLoading: boolean;
}

const FilesTable = ({ data = [], isLoading }: FilesTableProps) => {
  const { t } = useTranslation();
  const { fileColumns } = useResourceTableColumns();

  return (
    <ContentView
      id="filesTableId"
      className="resource-table dataset-files-table"
    >
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
          columns={fileColumns as any}
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

export default FilesTable;
