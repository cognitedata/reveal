import { Body, Button, Flex, Loader } from '@cognite/cogs.js';
import TableBulkActions from 'components/BulkAction';
import { PageHeader, Page, PageContent } from 'components/page';
import { useLabelName } from 'hooks/useLabel';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useDocumentsQuery } from 'services/query/documents/query';
import { useUpdateFileLabelsMutate } from 'services/query/files/mutate';
import { StickyTableHeadContainer } from 'styles/elements';
import { DocumentsSearchModal } from './components/modals/DocumentsSearch';
import { DocumentsTable } from './components/Table/DocumentsTable';

export const DocumentPage: React.FC = () => {
  const { externalId } = useParams<{ externalId: string }>();
  const labelName = useLabelName(externalId);

  const { data, isLoading } = useDocumentsQuery();
  const { mutate, isLoading: mutateLoading } =
    useUpdateFileLabelsMutate('remove');

  const [selectedIds, setSelectedIds] = React.useState({});
  const [showDocumentsModal, setShowDocuments] = React.useState(false);

  const toggleShowFiles = React.useCallback(
    () => setShowDocuments((prevState) => !prevState),
    []
  );

  const handleSelectedIds = (ids: { [x: number]: boolean }) => {
    setSelectedIds(ids);
  };

  const handleRemoveDocumentsClick = () => {
    const documentIds = Object.keys(selectedIds).map((item) => Number(item));
    mutate({ label: { externalId }, documentIds });
  };

  const renderTable = React.useMemo(
    () => (
      <DocumentsTable
        data={data}
        onSelectedIds={(ids) => handleSelectedIds(ids)}
      />
    ),
    [data]
  );

  if (isLoading) {
    return <Loader darkMode />;
  }

  if (showDocumentsModal) {
    return (
      <DocumentsSearchModal
        labelId={externalId}
        visible={showDocumentsModal}
        toggleVisibility={toggleShowFiles}
      />
    );
  }

  return (
    <Page>
      <PageHeader
        title={labelName}
        subtitle="Label:"
        Action={
          <Flex alignItems="center" gap={8}>
            <Body level="2">{data.length} files</Body>

            <Button
              icon="PlusCompact"
              type="primary"
              onClick={() => toggleShowFiles()}
            >
              Add files
            </Button>
          </Flex>
        }
        showGoBack
      />

      <PageContent>
        <StickyTableHeadContainer>{renderTable}</StickyTableHeadContainer>
      </PageContent>

      <TableBulkActions
        isVisible={Object.keys(selectedIds).length > 0}
        title={`${Object.keys(selectedIds).length} documents selected`}
      >
        <Button
          icon="Trash"
          loading={mutateLoading}
          onClick={() => handleRemoveDocumentsClick()}
        >
          Remove
        </Button>
      </TableBulkActions>
    </Page>
  );
};

export default DocumentPage;
