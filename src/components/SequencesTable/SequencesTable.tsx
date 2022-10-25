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
import { Sequence } from '@cognite/sdk';

interface sequencesTableProps {
  dataSetId: number;
  query: string;
  filters: ExploreDataFilters;
}

const SequencesTable = ({ dataSetId, query, filters }: sequencesTableProps) => {
  const { t } = useTranslation();
  const resourceTableColumns = useResourceTableColumns<Sequence>('sequences');
  const { data: sequences, isLoading: isSequencesLoading } = useQuery(
    getResourceSearchQueryKey('sequences', dataSetId, query, filters),
    () =>
      sdk.sequences.search(getResourceSearchParams(dataSetId, query, filters)),
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
        columns={resourceTableColumns}
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
