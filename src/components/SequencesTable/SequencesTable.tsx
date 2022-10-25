import { Table, TableNoResults } from '@cognite/cdf-utilities';
import { getContainer, ContentView } from 'utils';
import { useTranslation } from 'common/i18n';
import { useResourceTableColumns } from 'components/Data/ResourceTableColumns';
import { Sequence } from '@cognite/sdk';

interface sequencesTableProps {
  data: Sequence[] | undefined;
  isLoading: boolean;
}

const SequencesTable = ({ data = [], isLoading }: sequencesTableProps) => {
  const { t } = useTranslation();
  const resourceTableColumns = useResourceTableColumns<Sequence>('sequences');

  return (
    <ContentView id="sequencesTableId">
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

export default SequencesTable;
