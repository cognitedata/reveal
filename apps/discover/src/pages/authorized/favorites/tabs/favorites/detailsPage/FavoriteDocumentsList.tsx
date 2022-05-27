import { useFavoriteUpdateContent } from 'domain/favorites/internal/actions/useFavoritesMutate';

import * as React from 'react';

import flatten from 'lodash/flatten';
import {
  downloadFileFromUrl,
  zipFavoritesAndDownload,
} from 'services/documentPreview/utils';
import { useIsOwner } from 'services/user/utils';

import { useTranslation } from '@cognite/react-i18n';

import { LoadMoreButton } from 'components/Tablev3/elements';
import { showInfoMessageWithTitle } from 'components/Toast';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useDocumentsByIdForFavoritesQuery } from 'modules/documentSearch/hooks/useDocumentsByIdsForFavorites';
import { DocumentType } from 'modules/documentSearch/types';
import {
  DOWNLOAD_MESSAGE,
  DOWNLOADING,
} from 'pages/authorized/search/constants';
import { FlexAlignJustifyContent } from 'styles/layout';

import { DocumentsTable } from './content';

export const shouldShowLoadMoreButton = ({
  isDocumentsLoading,
  isDocumentsIdle,
  documentIds,
  loadedDocuments,
}: {
  isDocumentsLoading: boolean;
  isDocumentsIdle: boolean;
  documentIds?: number[];
  loadedDocuments: DocumentType[];
}) => {
  return (
    !(isDocumentsLoading || isDocumentsIdle) &&
    documentIds &&
    loadedDocuments.length < documentIds.length
  );
};

interface Props {
  favoriteId: string;
  documentIds?: number[];
  ownerId: string | undefined;
  previewDocument: (docId?: string) => void;
}
export const FavoriteDocumentsList: React.FC<Props> = ({
  documentIds,
  favoriteId,
  ownerId,
  previewDocument,
}) => {
  const {
    data,
    isLoading: isDocumentsLoading,
    isIdle: isDocumentsIdle,
    isFetchingNextPage,
    fetchNextPage,
  } = useDocumentsByIdForFavoritesQuery(documentIds);
  const { t } = useTranslation('Favorites');
  const { mutateAsync: mutateFavoriteContent } = useFavoriteUpdateContent();
  const metrics = useGlobalMetrics('favorites');
  const [currentFetchPage, setCurrentFetchPage] = React.useState(0);
  const { isOwner } = useIsOwner();
  const loadedDocuments = React.useMemo(
    () => flatten(data?.pages || []),
    [data?.pages]
  );

  const handleDocumentPreview = (document: DocumentType) => {
    if (document) {
      metrics.track('click-open-document-preview-button');
      previewDocument(document.id);
    }
  };

  const removeDocument = (document: DocumentType) => {
    mutateFavoriteContent({
      id: favoriteId,
      updateData: { removeDocumentIds: [Number(document.id)] },
    });
  };

  const handleDocumentsDownload = async (selectedDocuments: DocumentType[]) => {
    showInfoMessageWithTitle(t(DOWNLOADING), t(DOWNLOAD_MESSAGE));
    if (selectedDocuments && selectedDocuments.length) {
      if (selectedDocuments.length === 1) {
        await downloadFileFromUrl(selectedDocuments[0].id.toString());
      }
      await zipFavoritesAndDownload(selectedDocuments);
    }
  };

  const showLoadMore = shouldShowLoadMoreButton({
    isDocumentsLoading,
    isDocumentsIdle,
    documentIds,
    loadedDocuments,
  });

  return (
    <>
      <DocumentsTable
        isFavoriteSetOwner={isOwner(ownerId || '')}
        removeDocument={removeDocument}
        handleDocumentPreview={handleDocumentPreview}
        documentData={loadedDocuments}
        handleDocumentsDownload={handleDocumentsDownload}
        isLoading={isDocumentsIdle || isDocumentsLoading}
      />

      {showLoadMore && (
        <FlexAlignJustifyContent>
          <LoadMoreButton
            loading={isFetchingNextPage}
            onClick={() => {
              fetchNextPage({ pageParam: currentFetchPage + 1 });
              setCurrentFetchPage((prevState) => prevState + 1);
            }}
          />
        </FlexAlignJustifyContent>
      )}
    </>
  );
};
