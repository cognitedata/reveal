import { Table, TableNoResults } from '@cognite/cdf-utilities';
import { handleError, getContainer, ContentView } from 'utils';
import { useTranslation } from 'common/i18n';
import { useSearchResource } from 'hooks/useSearchResource';
import { useResourceTableColumns } from 'components/Data/ResourceTableColumns';

interface sequencesTableProps {
  dataSetId: number;
  query: string;
}

const SequencesTable = ({ dataSetId, query }: sequencesTableProps) => {
  const { t } = useTranslation();
  const { getResourceTableColumns } = useResourceTableColumns();
  const { data: sequences, isLoading: isSequencesLoading } = useSearchResource(
    'sequences',
    dataSetId,
    query,
    {
      onError: (e: any) => {
        handleError({ message: t('fetch-sequences-failed'), ...e });
      },
    }
  );

  return (
    <ContentView id="sequencesTableId">
      <Table
        rowKey="key"
        loading={isSequencesLoading}
        columns={[...getResourceTableColumns('sequences')]}
        dataSource={sequences || []}
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

export default SequencesTable;
