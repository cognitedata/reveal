import {
  useSavedSearchSort,
  useSavedSearchSortClear,
} from 'domain/savedSearches/internal/hooks/useSavedSearchSort';
import { useQuerySavedSearchCurrent } from 'domain/savedSearches/internal/queries/useQuerySavedSearchCurrent';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { Row } from 'react-table';

import compact from 'lodash/compact';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';

import { Icon, IconType } from '@cognite/cogs.js';

import DocumentViewModal from 'components/DocumentPreview/DocumentViewModal';
import { FavoriteStarIcon } from 'components/Icons/FavoriteStarIcon';
import { MiddleEllipsis } from 'components/MiddleEllipsis/MiddleEllipsis';
import { Table, RowProps } from 'components/Tablev3';
import { FooterPaginationServer } from 'components/Tablev3/FooterPaginationServer';
import { showErrorMessage } from 'components/Toast';
import { useDeepCallback, useDeepMemo } from 'hooks/useDeep';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { documentSearchActions } from 'modules/documentSearch/actions';
import { DOCUMENT_SEARCH_PAGE_LIMIT } from 'modules/documentSearch/constants';
import { useDocumentConfig } from 'modules/documentSearch/hooks';
import { useDocumentResultCount } from 'modules/documentSearch/hooks/useDocumentResultCount';
import { useExtractParentFolder } from 'modules/documentSearch/hooks/useExtractParentFolder';
import { useFavoriteDocumentIds } from 'modules/documentSearch/hooks/useFavoriteDocumentIds';
import {
  useDocuments,
  useSelectedDocumentIds,
} from 'modules/documentSearch/selectors';
import {
  DocumentType,
  DocumentFilterCategoryTitles,
} from 'modules/documentSearch/types';
import { ColumnMap } from 'modules/documentSearch/utils/getAvailableColumns';
import { getDocumentGeoPoint } from 'modules/documentSearch/utils/getGeoPoint';
import { sortByMap } from 'modules/documentSearch/utils/toSort';
import { setObjectFeedbackModalDocumentId } from 'modules/feedback/actions';
import {
  moveToCoords,
  toggleOtherGeo,
  zoomToCoords,
} from 'modules/map/actions';
import { SortBy } from 'pages/types';

import { DocumentResultTableHoverComponent } from './DocumentResultTableHoverComponent';
import { DocumentResultTableSubRow } from './DocumentResultTableSubRow';
import { useData } from './useData';

// this list is used as the PRIMARY list for which columns to display and make available.
export const columnMap: ColumnMap<DocumentType> = {
  filename: {
    Header: 'File Name',
    accessor: 'doc.filename',
    width: '300px',
    maxWidth: '1fr', // Fills up the available space
    order: 0,
    Cell: (cell) => <MiddleEllipsis value={cell.row.original.doc.filename} />,
  },
  creationdate: {
    id: 'created',
    Header: 'Created',
    accessor: 'createdDisplay',
    width: '140px',
    order: 1,
  },
  lastmodified: {
    id: 'modified',
    Header: 'Modified',
    accessor: 'modifiedDisplay',
    width: '140px',
    order: 2,
  },
  location: {
    Header: DocumentFilterCategoryTitles.location,
    accessor: 'doc.location',
    width: '100px',
    order: 3,
  },
  fileCategory: {
    title: DocumentFilterCategoryTitles.fileCategory,
    Header: <Icon type={'Document' as IconType} />,
    accessor: 'doc.fileCategory',
    width: '110px',
    order: 4,
  },
  labels: {
    Header: DocumentFilterCategoryTitles.labels,
    accessor: (row) =>
      row.labels?.join(', ') ||
      row.doc.labels.map((label) => label.externalId).join(', '),
    width: '200px',
    order: 5,
    disableSorting: true,
  },
  author: {
    Header: 'Author',
    accessor: 'doc.author',
    width: '150px',
    order: 6,
  },
  title: {
    id: 'doc.title',
    Header: 'Title',
    width: '150px',
    accessor: 'doc.title',
    order: 7,
  },
  topfolder: {
    Header: 'Top Folder',
    accessor: 'doc.topfolder',
    order: 8,
    width: '150px',
    disableSorting: true,
  },
  filesize: {
    Header: 'File Size',
    accessor: 'size',
    width: '100px',
    order: 9,
    disableSorting: true,
  },
  pageCount: {
    Header: 'No. of pages',
    accessor: 'pageCount',
    width: '90px',
    order: 10,
  },
};

interface Props {
  onHandleRowClick?: () => void;
}

export const DocumentResultTable: React.FC<Props> = ({ onHandleRowClick }) => {
  const { selectedColumns } = useDocuments();
  const { results, hasNextPage, isFetching, fetchNextPage } = useData();
  const dispatch = useDispatch();
  const { data: savedSearch } = useQuerySavedSearchCurrent();
  const initialSortBy = get(savedSearch, 'sortBy.documents');
  const updateSavedSearchSort = useSavedSearchSort();
  const savedSearchSortClear = useSavedSearchSortClear();
  const metrics = useGlobalMetrics('documents');
  const { data: config } = useDocumentConfig();
  const selectedDocumentIds = useSelectedDocumentIds();
  const favoriteDocumentIds = useFavoriteDocumentIds();
  const extractParentFolder = useExtractParentFolder();
  const documentResultCount = useDocumentResultCount();

  const [documentToPreview, setDocumentToPreview] = useState<
    DocumentType | undefined
  >(undefined);

  const [expandedDocumentIds, setExpandedDocumentIds] = useState<{
    [key: string]: boolean;
  }>({});

  const documentIds = useDeepMemo(
    () => results.map((document) => document.id),
    [results]
  );

  const documentIdsRef = useRef(documentIds);

  useEffect(() => {
    documentIdsRef.current = documentIds;
  }, [documentIds]);

  const columns = useDeepMemo(
    () =>
      sortBy(
        compact(selectedColumns.map((column) => columnMap[column])),
        'order'
      ),
    [selectedColumns]
  );

  // The reduce transforms it from an array of ids to an object:
  // { id123456: true, id234567: true, ... }
  const transformedSelectedDocumentIds = useDeepMemo(() => {
    return selectedDocumentIds.reduce(
      (result, id) => ({ ...result, [id]: true }),
      {}
    );
  }, [selectedDocumentIds]);

  const handleDoubleClick = React.useCallback((row: Row<DocumentType>) => {
    const doc = row.original;
    const geo = getDocumentGeoPoint(doc);
    if (geo) {
      // move map to the geo of thing clicked
      dispatch(zoomToCoords(geo));
    }
  }, []);

  const handleRowClick = React.useCallback((row: Row<DocumentType>) => {
    onHandleRowClick?.();

    const doc = row.original;

    setExpandedDocumentIds((state) => ({
      ...state,
      [doc.id]: !state[doc.id],
    }));
    const geo = getDocumentGeoPoint(doc);

    if (geo) {
      dispatch(moveToCoords(geo));
    }
  }, []);

  const handleRowSelect = useCallback(
    (row: RowProps<DocumentType>, nextState: boolean) => {
      batch(() => {
        if (row.original.geolocation && config?.showGeometryOnMap) {
          dispatch(toggleOtherGeo(row.original.id, row.original.geolocation));
        }
        if (nextState) {
          dispatch(documentSearchActions.selectDocumentIds([row.original.id]));
        } else {
          dispatch(
            documentSearchActions.unselectDocumentIds([row.original.id])
          );
        }
      });
    },
    []
  );

  const handleRowsSelect = useDeepCallback(
    (selected: boolean) => {
      if (selected) {
        dispatch(
          documentSearchActions.selectDocumentIds(documentIdsRef.current)
        );
      } else {
        dispatch(
          documentSearchActions.unselectDocumentIds(documentIdsRef.current)
        );
      }
    },
    [documentIdsRef.current]
  );

  const handleSort = useCallback((sortBy: SortBy[]) => {
    if (sortBy.length > 0 && sortByMap[sortBy[0].id]) {
      updateSavedSearchSort({ documents: sortBy });
    } else {
      savedSearchSortClear();
      showErrorMessage('Not supported!');
    }
  }, []);

  const options = useDeepMemo(
    () => ({
      checkable: true,
      expandable: true,
      flex: false,
      hideScrollbars: true,
      pagination: {
        enabled: false,
        pageSize: DOCUMENT_SEARCH_PAGE_LIMIT,
      },
      manualSortBy: true,
      sortBy: initialSortBy,
      rowOptions: {
        hoveredStyle: 'var(--cogs-greyscale-grey1)',
      },
    }),
    [initialSortBy]
  );

  const handleModalClose = () => {
    setDocumentToPreview(undefined);
    metrics.track('click-close-document-preview-button');
  };

  const handlePreviewClick = async (doc: DocumentType) => {
    setDocumentToPreview(doc);
    metrics.track('click-open-document-preview-button');
  };

  const onExtractParentFolder = (doc: DocumentType) => {
    extractParentFolder(doc);
  };

  const onOpenFeedback = (doc: DocumentType) => {
    const document = doc;
    dispatch(setObjectFeedbackModalDocumentId(document.doc.id));
    metrics.track('click-provide-document-feedback-button');
  };

  const renderRowHoverComponent = useCallback(
    ({ row }: any) => (
      <DocumentResultTableHoverComponent
        doc={row.original}
        onPreviewHandle={handlePreviewClick}
        onExtractParentFolderHandle={onExtractParentFolder}
        onOpenFeedbackHandle={onOpenFeedback}
      />
    ),
    []
  );

  const renderRowOverlayComponent = useCallback(
    ({ row }: any) => {
      const isAlreadyInFavorite = favoriteDocumentIds.includes(
        Number(row.original.id)
      );

      if (!isAlreadyInFavorite) {
        return null;
      }

      return <FavoriteStarIcon />;
    },
    [favoriteDocumentIds]
  );

  const renderRowSubComponent = useCallback(DocumentResultTableSubRow, [
    expandedDocumentIds,
  ]);

  const renderFooter = () => {
    return (
      <FooterPaginationServer
        handleLoadMore={hasNextPage ? fetchNextPage : undefined}
        showingResults={results.length}
        totalResults={documentResultCount}
        isLoading={isFetching}
        pageSize={DOCUMENT_SEARCH_PAGE_LIMIT}
      />
    );
  };

  return (
    <>
      <Table<DocumentType>
        scrollTable
        id="doc-result-table"
        data={results}
        columns={columns}
        Footer={renderFooter}
        handleRowClick={handleRowClick}
        handleDoubleClick={handleDoubleClick}
        handleRowSelect={handleRowSelect}
        handleRowsSelect={handleRowsSelect}
        handleSort={handleSort}
        selectedIds={transformedSelectedDocumentIds}
        expandedIds={expandedDocumentIds}
        options={options}
        renderRowOverlayComponent={renderRowOverlayComponent}
        renderRowHoverComponent={renderRowHoverComponent}
        renderRowSubComponent={renderRowSubComponent}
      />
      {documentToPreview?.doc.id && (
        <DocumentViewModal
          documentId={documentToPreview?.doc.id}
          fileName={documentToPreview?.filename}
          onModalClose={handleModalClose}
          modalOpen={!!documentToPreview}
        />
      )}
    </>
  );
};
