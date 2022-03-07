import { Body, Button, Flex } from '@cognite/cogs.js';
import { Page, PageContent, PageHeader } from 'src/components/page';
import { TableWrapper } from 'src/components/table/TableWrapper';
import {
  Labels,
  LabelsTable,
} from 'src/components/table/LabelsTable/LabelsTable';
import React from 'react';
import TableBulkActions from 'src/components/table/BulkAction';
import { useBreadcrumb } from 'src/hooks/useBreadcrumb';
import { useDocumentsPipelinesQuery } from 'src/services/query/pipelines/query';
import { ExternalLabelDefinition } from '@cognite/sdk';
import {
  useLabelsCreateMutate,
  useLabelsDeleteMutate,
} from 'src/services/query/labels/mutate';
import { useLabelsQuery } from 'src/services/query/labels/query';
import { CreateLabelModal } from './components/modal/CreateLabelModal';

export const LabelsPage: React.FC = () => {
  const [selectedLabels, setSelectedLabels] = React.useState<Labels[]>([]);

  const { data: pipeline } = useDocumentsPipelinesQuery();
  const { labelsPageBreadcrumbs } = useBreadcrumb();

  const { data } = useLabelsQuery();

  const { mutateAsync: createLabelAsync, isLoading } = useLabelsCreateMutate();
  const { mutate: deleteLabels } = useLabelsDeleteMutate();

  const [showCreateLabelModal, setShowCreateLabelModal] = React.useState(false);
  const toggleLabelsModal = React.useCallback(() => {
    setShowCreateLabelModal((prevState) => !prevState);
  }, []);

  const handleCreateLabelClick = (label: ExternalLabelDefinition) => {
    createLabelAsync(label).then(() => {
      toggleLabelsModal();
    });
  };

  const handleDeleteLabelsClick = () => {
    const ids = selectedLabels.map(({ externalId }) => ({
      externalId,
    }));

    deleteLabels(ids);
  };

  const renderTable = React.useMemo(
    () => (
      <LabelsTable
        onSelectionChange={(event) => setSelectedLabels(event)}
        showAllLabels
      />
    ),
    []
  );

  return (
    <Page breadcrumbs={labelsPageBreadcrumbs(pipeline?.classifier?.name)}>
      <PageHeader
        title="Labels"
        showGoBack
        Action={
          <Flex alignItems="center" gap={8}>
            <Body level="2">{data.length} labels</Body>

            <Button
              icon="AddLarge"
              type="primary"
              onClick={() => toggleLabelsModal()}
            >
              Create label
            </Button>
          </Flex>
        }
      />

      <CreateLabelModal
        visible={showCreateLabelModal}
        toggleVisibility={toggleLabelsModal}
        onCreateClick={handleCreateLabelClick}
        isCreatingLabel={isLoading}
      />

      <PageContent>
        <TableWrapper stickyHeader>{renderTable}</TableWrapper>
      </PageContent>

      <TableBulkActions
        isVisible={selectedLabels.length > 0}
        title={`${selectedLabels.length} labels selected`}
      >
        <Button
          type="secondary"
          icon="Delete"
          onClick={() => handleDeleteLabelsClick()}
        >
          Remove
        </Button>
      </TableBulkActions>
    </Page>
  );
};
