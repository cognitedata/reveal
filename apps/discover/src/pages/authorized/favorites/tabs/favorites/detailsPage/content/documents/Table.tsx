import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import reduce from 'lodash/reduce';

import { DownloadButton, CloseButton } from 'components/buttons';
import EmptyState from 'components/emptyState';
import TableBulkActions from 'components/table-bulk-actions';
import { Table, TableResults, RowProps } from 'components/tablev3';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { FavoriteDocumentData, FavouriteRowType } from 'modules/favorite/types';
import { FAVORITE_SET_NO_DOCUMENTS } from 'pages/authorized/favorites/constants';
import { TableBulkActionsWrapper } from 'pages/authorized/favorites/elements';

import { Actions } from './Actions';
import { Metadata } from './Metadata';
import { Summary } from './Summary';

interface Props {
  removeDocument: (doc: FavoriteDocumentData) => void;
  handleDocumentPreview: (doc: FavoriteDocumentData) => void;
  documentData: FavoriteDocumentData[];
  handleDocumentsDownload: (documents: FavoriteDocumentData[]) => void;
  isFavoriteSetOwner: boolean;
  isLoading: boolean;
}

type FavoriteRowData = FavouriteRowType<FavoriteDocumentData>;

export const FavoriteDocumentsTable: React.FC<Props> = ({
  handleDocumentPreview,
  documentData,
  removeDocument,
  handleDocumentsDownload,
  isFavoriteSetOwner,
  isLoading,
}) => {
  const [tableKey, setTableKey] = React.useState<number>(documentData.length);
  const [selectedIds, setSelectedIds] = React.useState<TableResults>({});
  const { t } = useTranslation('Favorites');
  const metrics = useGlobalMetrics('favorites');

  // reset the table when we get more documents
  // so that any internal selection hooks update
  useEffect(() => {
    setTableKey(documentData.length);
  }, [documentData]);

  /**
   * Reason for eslint-disable: components that are inline-rendered for React-Table cell,
   * makes sense to be "inlined", as it is easier to read and closer to the column cell settings.
   */
  const columns = useMemo(
    () => [
      {
        Header: t('File Details'),
        disableSortBy: true,
        // eslint-disable-next-line react/no-unstable-nested-components
        Cell: ({ row }: FavouriteRowType<FavoriteDocumentData>) => (
          <Summary
            filename={row.original.name}
            filepath={row.original.path}
            truncatedContent={row.original.truncatedContent}
            openPreview={() => {
              handleDocumentPreview(row.original);
            }}
          />
        ),
        width: '400px',
        maxWidth: '0.5fr',
      },
      {
        Header: t('Metadata'),
        disableSortBy: true,
        // eslint-disable-next-line react/no-unstable-nested-components
        Cell: (row: FavoriteRowData) => <Metadata data={row.row.original} />,
        width: '400px',
        maxWidth: '0.5fr',
      },
    ],
    []
  );

  const renderRowHoverComponent = (
    row: FavouriteRowType<FavoriteDocumentData>
  ) => (
    <Actions
      removeDocument={removeDocument}
      row={row}
      showRemoveOption={isFavoriteSetOwner}
    />
  );

  const options = useMemo(
    () => ({
      checkable: true,
      flex: false,
      hideScrollbars: true,
      manualSortBy: false,
    }),
    []
  );

  const handleDownloadSelectedDocuments = () => {
    metrics.track('click-download-selected-documents-button');
    handleDocumentsDownload(
      documentData.filter((document) => !!selectedIds[document.id])
    );
  };

  // toggle all on/off
  const handleAllDocumentsSelected = (selected: boolean) => {
    metrics.track('click-select-all-documents-button');

    setSelectedIds(
      documentData.reduce((result, doc) => {
        return {
          ...result,
          [doc.id]: selected,
        };
      }, {})
    );
  };

  const handleSelection = (
    row: RowProps<FavoriteDocumentData>,
    value: boolean
  ) => {
    setSelectedIds((prevState) => {
      return {
        ...prevState,
        [row.id]: value,
      };
    });
  };

  const handleClearSelection = () => {
    metrics.track('click-clear-document-selection-button');
    handleAllDocumentsSelected(false);
  };

  const totalSelectedIds = reduce(
    selectedIds,
    (total, value) => (value ? total + 1 : total),
    0
  );

  const title = `${totalSelectedIds} ${
    totalSelectedIds > 1 ? 'documents' : 'document'
  } selected`;

  if (!documentData.length) {
    return (
      <EmptyState
        emptyTitle={t(FAVORITE_SET_NO_DOCUMENTS)}
        isLoading={isLoading}
      />
    );
  }
  return (
    <>
      <Table<FavoriteDocumentData>
        key={tableKey}
        id="favorite-documents-table"
        columns={columns}
        data={documentData}
        options={options}
        selectedIds={selectedIds}
        handleRowSelect={handleSelection}
        handleRowsSelect={handleAllDocumentsSelected}
        renderRowHoverComponent={renderRowHoverComponent}
      />

      <TableBulkActionsWrapper>
        <TableBulkActions isVisible={!!totalSelectedIds} title={title}>
          <DownloadButton
            variant="inverted"
            tooltip={t('Download selected documents')}
            onClick={handleDownloadSelectedDocuments}
            data-testid="document-favorite-all-button"
          />

          <TableBulkActions.Separator />

          <CloseButton
            variant="inverted"
            tooltip={t('Clear selection')}
            onClick={handleClearSelection}
            data-testid="document-favorite-all-button"
          />
        </TableBulkActions>
      </TableBulkActionsWrapper>
    </>
  );
};
