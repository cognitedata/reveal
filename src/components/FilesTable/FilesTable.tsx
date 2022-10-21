import { Table, TableNoResults } from '@cognite/cdf-utilities';
import { ContentView, getContainer, handleError } from 'utils';
import { useTranslation } from 'common/i18n';
import { useSearchResource } from 'hooks/useSearchResource';
import { useResourceTableColumns } from 'components/Data/ResourceTableColumns';

interface filesTableProps {
  dataSetId: number;
  query: string;
}

const FilesTable = ({ dataSetId, query }: filesTableProps) => {
  const { t } = useTranslation();
  const { getResourceTableColumns } = useResourceTableColumns();
  const { data: files, isLoading: isFilesLoading } = useSearchResource(
    'files',
    dataSetId,
    query,
    {
      onError: (e: any) => {
        handleError({ message: t('fetch-files-failed'), ...e });
      },
    }
  );

  return (
    <ContentView id="filesTableId">
      <Table
        rowKey="key"
        loading={isFilesLoading}
        columns={[...getResourceTableColumns('files')]}
        dataSource={files || []}
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
