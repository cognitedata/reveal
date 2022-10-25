import { Table, TableNoResults } from '@cognite/cdf-utilities';
import { getContainer, ContentView } from 'utils';
import { useTranslation } from 'common/i18n';
import { useResourceTableColumns } from 'components/Data/ResourceTableColumns';
import { FileInfo } from '@cognite/sdk';

interface FilesTableProps {
  data: FileInfo[] | undefined;
  isLoading: boolean;
}

const FilesTable = ({ data = [], isLoading }: FilesTableProps) => {
  const { t } = useTranslation();
  const resourceTableColumns = useResourceTableColumns<FileInfo>('files');

  return (
    <ContentView id="filesTableId">
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

export default FilesTable;
