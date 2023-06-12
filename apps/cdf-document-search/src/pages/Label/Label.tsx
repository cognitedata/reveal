import React from 'react';

import { Body, Button, Flex, Loader } from '@cognite/cogs.js';

import { Page, PageContent, PageHeader } from '../../components/page';
import TableBulkActions from '../../components/table/BulkAction';
import { TableWrapper } from '../../components/table/TableWrapper';
import { useBreadcrumb } from '../../hooks/useBreadcrumb';
import { useClassifierName } from '../../hooks/useClassifierName';
import { useLabelName } from '../../hooks/useLabelName';
import { useLabelParams } from '../../hooks/useParams';
import { useDocumentsQuery } from '../../services/query/documents/query';
import { useUpdateFileLabelsMutate } from '../../services/query/files/mutate';

import { DocumentsSearchModal } from './components/modals/DocumentsSearchModal';
import { DocumentsTable } from './components/table/DocumentsTable';

export const LabelPage: React.FC = () => {
  const externalId = useLabelParams();
  const { classifierName } = useClassifierName();
  const { labelName } = useLabelName(externalId);
  const { labelPageBreadcrumbs } = useBreadcrumb();

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
    const fileIds = Object.keys(selectedIds).map((item) => Number(item));
    mutate({ label: { externalId }, fileIds });
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

  return (
    <>
      <Page breadcrumbs={labelPageBreadcrumbs(classifierName, labelName)}>
        <PageHeader
          title={labelName}
          subtitle="Label:"
          Action={
            <Flex alignItems="center" gap={8}>
              <Body level="2">{data.length} files</Body>

              <Button
                icon="AddLarge"
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
          <TableWrapper stickyHeader>{renderTable}</TableWrapper>
        </PageContent>

        <TableBulkActions
          isVisible={Object.keys(selectedIds).length > 0}
          title={`${Object.keys(selectedIds).length} documents selected`}
        >
          <Button
            icon="Delete"
            loading={mutateLoading}
            onClick={() => handleRemoveDocumentsClick()}
          >
            Remove
          </Button>
        </TableBulkActions>
      </Page>
      <DocumentsSearchModal
        labelId={externalId}
        visible={showDocumentsModal}
        toggleVisibility={toggleShowFiles}
      />
    </>
  );
};

export default LabelPage;
