import { Table } from '@cognite/cogs.js';
import { Document } from '@cognite/sdk-playground';
import { Empty } from 'src/components/states/Empty';
import React from 'react';
import { DocumentPreview } from '../layover/DocumentPreview';
import { curateColumns } from './curateDocumentsColumns';
import { DocumentsFilters } from './filters';

type DocumentPreviewState = {
  show: boolean;
  documentId?: number;
};

interface Props {
  data: Document[];
  showFilters?: boolean;
  selectedIds?: { [x: number]: boolean };
  onSelectedIds?: (ids: { [x: number]: boolean }) => void;
}
export const DocumentsTable: React.FC<Props> = React.memo(
  ({ data, showFilters, selectedIds, onSelectedIds }) => {
    const [documentPreview, setDocumentPreview] =
      React.useState<DocumentPreviewState>({
        show: false,
        documentId: undefined,
      });

    const toggleDocumentPreview = React.useCallback(
      (documentId?: number) =>
        setDocumentPreview((prevState) => ({
          show: !prevState.show,
          documentId,
        })),
      []
    );

    const handleSelectionChange = (event: Document[]) => {
      const ids = event.reduce((accumulator, item) => {
        return { ...accumulator, [item.id]: true };
      }, {});

      if (onSelectedIds) {
        onSelectedIds(ids);
      }
    };

    const columns = React.useMemo(
      () => curateColumns({ toggleDocumentPreview }),
      [toggleDocumentPreview]
    );

    const renderFilters = React.useMemo(() => {
      if (showFilters) {
        return <DocumentsFilters />;
      }

      return null;
    }, [showFilters]);

    return (
      <>
        {renderFilters}

        <Table<Document>
          onSelectionChange={handleSelectionChange}
          defaultSelectedIds={selectedIds}
          pagination={false}
          dataSource={data}
          columns={columns as any}
          locale={{
            emptyText: <Empty />,
          }}
        />

        <DocumentPreview
          documentId={documentPreview.documentId}
          visible={documentPreview.show}
          toggleVisibility={toggleDocumentPreview}
        />
      </>
    );
  }
);
