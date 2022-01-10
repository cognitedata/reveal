import React, { useCallback, useState } from 'react';
import { batch, useDispatch } from 'react-redux';

import compact from 'lodash/compact';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import { getDateOrDefaultText } from 'utils/date';

import { Icon, AllIconTypes } from '@cognite/cogs.js';

import DocumentViewModal from 'components/document-preview-card/DocumentViewModal';
import { FavoriteStarIcon } from 'components/icons/FavoriteStarIcon';
import { getMiddleEllipsisWrapper } from 'components/middle-ellipsis/MiddleEllipsis';
import { Table, RowProps } from 'components/tablev3';
import { showErrorMessage } from 'components/toast';
import { DEFAULT_PAGE_SIZE } from 'constants/app';
import { useDeepCallback, useDeepMemo } from 'hooks/useDeep';
import { useDocumentsForTable } from 'hooks/useDocumentsForTable';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import {
  useSavedSearchSort,
  useSavedSearchSortClear,
} from 'modules/api/savedSearches/hooks/useSavedSearchSort';
import { useQuerySavedSearchCurrent } from 'modules/api/savedSearches/useQuery';
import { documentSearchActions } from 'modules/documentSearch/actions';
import { useDocumentConfig } from 'modules/documentSearch/hooks';
import { useExtractParentFolder } from 'modules/documentSearch/hooks/useExtractParentFolder';
import { useFavoriteDocumentIds } from 'modules/documentSearch/hooks/useFavoriteDocumentIds';
import {
  useDocuments,
  useSelectedDocumentIds,
} from 'modules/documentSearch/selectors';
import {
  DocumentRowType,
  DocumentType,
  DocumentTypeDataModel,
  DocumentFilterCategoryTitles,
} from 'modules/documentSearch/types';
import { ColumnMap } from 'modules/documentSearch/utils/columns';
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

// this list is used as the PRIMARY list for which columns to display and make available.
export const columnMap: ColumnMap<DocumentTypeDataModel> = {
  filename: {
    Header: 'File Name',
    accessor: 'doc.filename',
    width: '300px',
    maxWidth: '1fr', // Fills up the available space
    order: 0,
    Cell: (cell) =>
      getMiddleEllipsisWrapper(cell.row.original.doc.filename, false),
  },
  creationdate: {
    id: 'created',
    Header: 'Created',
    accessor: (row) => getDateOrDefaultText(row.created),
    width: '140px',
    order: 1,
  },
  lastmodified: {
    id: 'modified',
    Header: 'Modified',
    accessor: (row) => getDateOrDefaultText(row.modified),
    width: '140px',
    order: 2,
  },
  location: {
    Header: DocumentFilterCategoryTitles.location,
    accessor: 'doc.location',
    width: '100px',
    order: 3,
  },
  filetype: {
    title: DocumentFilterCategoryTitles.filetype,
    Header: <Icon type={'Document' as AllIconTypes} />,
    accessor: 'doc.filetype',
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
    accessor: (row) => row.doc?.title || 'N/A',
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
    width: '50px',
    order: 10,
  },
};

export const DocumentResultTable: React.FC = () => {
  const { selectedColumns } = useDocuments();

  const data = useDocumentsForTable();
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

  const [documentToPreview, setDocumentToPreview] = useState<
    DocumentTypeDataModel | undefined
  >(undefined);

  const [expandedDocumentIds, setExpandedDocumentIds] = useState<{
    [key: string]: boolean;
  }>({});

  const documentIds = useDeepMemo(
    () => data.map((document) => document.id),
    [data]
  );

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

  const handleDoubleClick = React.useCallback((row: DocumentRowType) => {
    const doc = row.original;
    const geo = getDocumentGeoPoint(doc);
    if (geo) {
      // move map to the geo of thing clicked
      dispatch(zoomToCoords(geo));
    }
  }, []);

  const handleRowClick = React.useCallback((row: DocumentRowType) => {
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
        dispatch(documentSearchActions.selectDocumentIds(documentIds));
      } else {
        dispatch(documentSearchActions.unselectDocumentIds(documentIds));
      }
    },
    [documentIds]
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
        enabled: true,
        pageSize: DEFAULT_PAGE_SIZE,
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

  const handlePreviewClick = async (row: DocumentRowType) => {
    setDocumentToPreview(row.original);
    metrics.track('click-open-document-preview-button');
  };

  const onExtractParentFolder = (row: DocumentRowType) => {
    extractParentFolder(row.original);
  };

  const onOpenFeedback = (row: DocumentRowType) => {
    const document = row.original;
    dispatch(setObjectFeedbackModalDocumentId(document.doc.id));
    metrics.track('click-provide-document-feedback-button');
  };

  const renderRowHoverComponent = useCallback(
    ({ row }) => (
      <DocumentResultTableHoverComponent
        row={row}
        onPreviewHandle={handlePreviewClick}
        onExtractParentFolderHandle={onExtractParentFolder}
        onOpenFeedbackHandle={onOpenFeedback}
      />
    ),
    []
  );

  const renderRowOverlayComponent = useCallback(
    ({ row }) => {
      const isAlreadyInFavorite = favoriteDocumentIds.includes(
        Number(row.original.id)
      );

      if (!isAlreadyInFavorite) return null;

      return <FavoriteStarIcon />;
    },
    [favoriteDocumentIds]
  );

  const renderRowSubComponent = useCallback(DocumentResultTableSubRow, [
    expandedDocumentIds,
  ]);

  return (
    <>
      <Table<DocumentType>
        scrollTable
        id="doc-result-table"
        data={data}
        columns={columns}
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
      <DocumentViewModal
        documentId={documentToPreview?.doc.id || ''}
        fileName={documentToPreview?.filename}
        onModalClose={handleModalClose}
        modalOpen={!!documentToPreview}
      />
    </>
  );
};
