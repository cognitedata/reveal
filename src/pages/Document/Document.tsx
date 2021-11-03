import { Loader } from '@cognite/cogs.js';
import { Header } from 'components/Header';
import { Page } from 'components/Page';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useDocumentsQuery } from 'services/query/documents/query';
import { useUpdateFileLabelsMutate } from 'services/query/files/mutate';
import {
  DocumentHeader,
  DocumentHeaderAction,
} from './components/DocumentHeader';
import { DocumentsSearchModal } from './components/modals/DocumentsSearch';
import { DocumentsTable } from './components/Table/DocumentsTable';

export const DocumentPage: React.FC = () => {
  const { externalId } = useParams<{ externalId: string }>();
  const { data, isLoading } = useDocumentsQuery();
  const { mutate } = useUpdateFileLabelsMutate('remove');

  const [selectedIds, setSelectedIds] = React.useState({});
  const [showDocumentsModal, setShowDocuments] = React.useState(false);

  const toggleShowFiles = React.useCallback(
    () => setShowDocuments((prevState) => !prevState),
    []
  );

  const handleSelectedIds = (ids: { [x: number]: boolean }) => {
    setSelectedIds(ids);
  };

  const handleHeaderActionClick = (action: DocumentHeaderAction) => {
    if (action === 'add') {
      toggleShowFiles();
    }
    if (action === 'remove') {
      const documentIds = Object.keys(selectedIds).map((item) => Number(item));
      mutate({ label: { externalId }, documentIds });
    }
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
      <Header
        title={externalId}
        subtitle="Label:"
        Action={
          <DocumentHeader
            dataLength={data.length}
            selectedIdsLength={Object.keys(selectedIds).length}
            onActionClick={handleHeaderActionClick}
          />
        }
        showGoBack
      />

      {renderTable}
    </Page>
  );
};

export default DocumentPage;
