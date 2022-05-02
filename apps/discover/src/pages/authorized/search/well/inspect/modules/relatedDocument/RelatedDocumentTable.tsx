import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Row } from 'react-table';

import DocumentViewModal from 'components/DocumentPreview/DocumentViewModal';
import EmptyState from 'components/EmptyState';
import { NO_RESULTS_TEXT } from 'components/EmptyState/constants';
import { Table, Options, TableResults, RowProps } from 'components/Tablev3';
import { DEFAULT_PAGE_SIZE } from 'constants/app';
import {
  LOG_RELATED_DOCUMENTS,
  LOG_WELLS_RELATED_DOCUMENTS,
} from 'constants/logging';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import {
  useCreateMetricAndStartTimeLogger,
  useStopTimeLogger,
  TimeLogStages,
} from 'hooks/useTimeLog';
import { DocumentResult, DocumentType } from 'modules/documentSearch/types';
import { setObjectFeedbackModalDocumentId } from 'modules/feedback/actions';
import {
  useRelatedDocumentData,
  useSelectedColumns,
} from 'modules/wellSearch/selectors/relatedDocuments/hooks/useRelatedDocument';
import { DocumentResultTableHoverComponent } from 'pages/authorized/search/document/results/DocumentResultTableHoverComponent';
import { DocumentResultTableSubRow } from 'pages/authorized/search/document/results/DocumentResultTableSubRow';
import { DocumentsBulkActions } from 'pages/authorized/search/document/results/DocumentsBulkActions';
import { FlexAlignJustifyContent } from 'styles/layout';

import { TableBulkActionsHolder } from './elements';
import { RelatedDocumentAppliedFilters } from './RelatedDocumentAppliedFilters';

interface Props {
  data?: DocumentResult;
}

export const RelatedDocumentTable: React.FC = () => {
  const { isLoading, data } = useRelatedDocumentData();

  if (isLoading || data.length === 0) {
    return (
      <EmptyState isLoading={isLoading} emptyTitle={NO_RESULTS_TEXT}>
        <FlexAlignJustifyContent>
          <RelatedDocumentAppliedFilters showClearTag />
        </FlexAlignJustifyContent>
      </EmptyState>
    );
  }

  return <RelatedDocumentTableComponent />;
};

export const RelatedDocumentTableComponent: React.FC<Props> = () => {
  const renderTimer = useCreateMetricAndStartTimeLogger(
    TimeLogStages.Render,
    LOG_RELATED_DOCUMENTS,
    LOG_WELLS_RELATED_DOCUMENTS
  );

  const metrics = useGlobalMetrics('wells');
  const dispatch = useDispatch();
  const { data: documentData } = useRelatedDocumentData();
  const selectedColumns = useSelectedColumns();

  const [selectedIds, setSelectedIds] = useState<TableResults>({});
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [document, setDocument] = useState<DocumentType>();
  const [expandedIds, setExpandedIds] = useState<TableResults>({});

  const selectedList = useMemo(
    () =>
      Object.keys(selectedIds)
        .filter((id) => selectedIds[id])
        .map((id) => Number(id)),
    [selectedIds]
  );

  const onOpenFeedback = (doc: DocumentType) => {
    dispatch(setObjectFeedbackModalDocumentId(doc.id));
    metrics.track('click-provide-document-feedback-button');
  };

  const handleRowClick = useCallback((row: Row<DocumentType>) => {
    const { id } = row.original;

    setExpandedIds((state) => ({
      ...state,
      [id]: !state[id],
    }));
  }, []);

  const handlePreviewDocument = useCallback((doc: DocumentType) => {
    setDocument(doc);
    setShowModal(true);
    metrics.track('click-open-document-preview-button');
  }, []);

  const handleModalClose = () => {
    setShowModal(false);
    metrics.track('click-close-document-preview-button');
  };

  const handleRowSelect = useCallback((row: RowProps<DocumentType>) => {
    setSelectedIds((state) => ({
      ...state,
      [row.original.id]: !state[row.original.id],
    }));
  }, []);

  const handleRowsSelect = useCallback(
    (value: boolean) => {
      const unmappedDocumentsId: TableResults = documentData.reduce(
        (result, item) => {
          const newItem: TableResults = { [item.id]: value };
          return { ...result, ...newItem };
        },
        {}
      );

      setSelectedIds(unmappedDocumentsId);
    },
    [documentData]
  );

  const renderRowHoverComponent = useCallback(
    ({ row }) => (
      <DocumentResultTableHoverComponent
        doc={row.original}
        onPreviewHandle={handlePreviewDocument}
        onOpenFeedbackHandle={onOpenFeedback}
      />
    ),
    []
  );

  const renderRowSubComponent = useCallback(DocumentResultTableSubRow, [
    expandedIds,
  ]);

  const fileName = document?.doc.title || document?.doc.filename;

  const [options] = useState<Options>({
    expandable: true,
    checkable: true,
    flex: false,
    hideScrollbars: true,
    pagination: {
      enabled: true,
      pageSize: DEFAULT_PAGE_SIZE,
    },
  });

  useStopTimeLogger(renderTimer);

  return (
    <>
      <Table<DocumentType>
        data-testid="related-document-table"
        id="related-document-table"
        data={documentData}
        columns={selectedColumns}
        options={options}
        expandedIds={expandedIds}
        selectedIds={selectedIds}
        handleRowClick={handleRowClick}
        handleRowSelect={handleRowSelect}
        handleRowsSelect={handleRowsSelect}
        renderRowHoverComponent={renderRowHoverComponent}
        renderRowSubComponent={renderRowSubComponent}
        scrollTable
      />
      {showModal && (
        <DocumentViewModal
          documentId={document?.doc.id as string}
          fileName={fileName}
          onModalClose={handleModalClose}
          modalOpen={showModal}
        />
      )}
      <TableBulkActionsHolder>
        <DocumentsBulkActions
          selectedDocumentIds={selectedList}
          handleDeselectAll={() => setSelectedIds({})}
        />
      </TableBulkActionsHolder>
    </>
  );
};
