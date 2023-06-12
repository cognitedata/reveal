import { Button, Loader, Table } from '@cognite/cogs.js';
import TableBulkActions from 'apps/cdf-document-search/src/components/table/BulkAction';
import { PageContent } from 'apps/cdf-document-search/src/components/page';
import { Empty } from 'apps/cdf-document-search/src/components/states/Empty';
import { TableWrapper } from 'apps/cdf-document-search/src/components/table/TableWrapper';
import { useNavigation } from 'apps/cdf-document-search/src/hooks/useNavigation';
import React from 'react';
import { useClassifierManageTrainingSetsQuery } from 'apps/cdf-document-search/src/services/query/classifier/query';
import { useDocumentsUpdatePipelineMutate } from 'apps/cdf-document-search/src/services/query/pipelines/mutate';
import { ClassifierTrainingSet } from 'apps/cdf-document-search/src/services/types';
import { curateColumns } from './curateTrainingSetsColumns';

export const TrainingSetsTable: React.FC = () => {
  const [selectedTrainingSets, setSelectedTrainingSets] = React.useState<
    ClassifierTrainingSet[]
  >([]);

  const { data, isLoading } = useClassifierManageTrainingSetsQuery();
  const { mutate } = useDocumentsUpdatePipelineMutate('remove');

  const navigate = useNavigation();
  const columns = React.useMemo(() => curateColumns(navigate), [navigate]);

  const handleRemoveLabelsClick = () => {
    const labels = selectedTrainingSets.map(({ id }) => ({
      externalId: id,
    }));

    mutate(labels);
  };

  const handleSectionChange = React.useCallback(
    (event: ClassifierTrainingSet[]) => {
      setSelectedTrainingSets(event);
    },
    []
  );

  const renderTable = React.useMemo(
    () => (
      <Table<ClassifierTrainingSet>
        onSelectionChange={handleSectionChange}
        pagination={false}
        filterable
        dataSource={data}
        columns={columns as any}
        rowKey={(d) => String(d.id)}
        locale={{ emptyText: <Empty /> }}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, handleSectionChange]
  );

  if (isLoading) {
    return <Loader darkMode />;
  }

  return (
    <>
      <PageContent>
        <TableWrapper stickyHeader>{renderTable}</TableWrapper>
      </PageContent>
      <TableBulkActions
        isVisible={selectedTrainingSets.length > 0}
        title={`${selectedTrainingSets.length} labels selected`}
      >
        <Button
          type="secondary"
          icon="Delete"
          onClick={() => handleRemoveLabelsClick()}
        >
          Remove
        </Button>
      </TableBulkActions>
    </>
  );
};
