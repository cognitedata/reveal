import React, { useEffect, useState } from 'react';
import { Switch, Route, useHistory, useLocation } from 'react-router-dom';

import flatten from 'lodash/flatten';
import omit from 'lodash/omit';
import {
  downloadFileFromUrl,
  zipFavoritesAndDownload,
} from 'services/documentPreview/utils';
import { useFavoriteUpdateContent } from 'services/favorites/useFavoritesMutate';
import { useIsOwner } from 'services/user/utils';

import { Badge, Icon, Tabs } from '@cognite/cogs.js';
import { FavoriteContent } from '@cognite/discover-api-types';
import { useTranslation } from '@cognite/react-i18n';

import DocumentViewModal from 'components/document-preview-card/DocumentViewModal';
import EmptyState from 'components/emptyState';
import { LoadMoreButton } from 'components/tablev3/elements';
import { showInfoMessageWithTitle } from 'components/toast';
import navigation from 'constants/navigation';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useDocumentsByIdForFavoritesQuery } from 'modules/documentSearch/hooks/useDocumentsByIdsForFavorites';
import { FavoriteDocumentData } from 'modules/favorite/types';
import { useWellsCacheQuery } from 'modules/wellSearch/hooks/useWellsCacheQuery';
import {
  DOWNLOAD_MESSAGE,
  DOWNLOADING,
} from 'pages/authorized/search/constants';
import { NavigationTab } from 'pages/types';
import { FlexAlignJustifyContent } from 'styles/layout';

import { PageContainer } from '../../../elements';
import { TabBar } from '../elements';

import { DocumentsTable, WellsTable } from './content';

export interface Props {
  favoriteId: string;
  content: FavoriteContent | undefined;
  ownerId: string | undefined;
}

enum FavoriteTabs {
  documents = 'documents',
  wells = 'wells',
}

export const FavoriteDetailsContent: React.FC<Props> = ({
  content,
  favoriteId,
  ownerId,
}) => {
  const {
    data,
    isLoading: isDocumentsLoading,
    isIdle: isDocumentsIdle,
    isFetchingNextPage,
    fetchNextPage,
  } = useDocumentsByIdForFavoritesQuery(content?.documentIds);

  const [currentFetchPage, setCurrentFetchPage] = useState(0);

  const { isLoading: isWellsLoading, isIdle: isWellsIdle } = useWellsCacheQuery(
    content?.wells ? Object.keys(content.wells) : []
  );

  const [documentId, setDocumentId] = useState<string | undefined>(undefined);
  const { mutateAsync: mutateFavoriteContent } = useFavoriteUpdateContent();

  const { pathname } = useLocation();
  const history = useHistory();
  const metrics = useGlobalMetrics('favorites');
  const { t } = useTranslation('Favorites');
  const { isOwner } = useIsOwner();
  const [documents, setDocuments] = useState<FavoriteDocumentData[]>([]);

  const navigationTabItems: NavigationTab[] = [
    {
      key: `${FavoriteTabs.documents}`,
      name: 'Documents',
      path: navigation.FAVORITE_TAB_DOCUMENTS(favoriteId),
    },
    {
      key: `${FavoriteTabs.wells}`,
      name: 'Wells',
      path: navigation.FAVORITE_TAB_WELLS(favoriteId),
    },
  ];

  useEffect(() => {
    if (data) {
      setDocuments(flatten(data.pages));
    }
  }, [data]);

  useEffect(() => {
    setCurrentFetchPage(0);
  }, [content]);

  const activeTab = React.useMemo(
    () => navigationTabItems.find((y) => y.path === pathname)?.key,
    [pathname]
  );

  const handleNavigation = (tabKey: string) => {
    metrics.track(`click-${tabKey.toLowerCase()}-tab`);

    const tabItem = navigationTabItems.find((item) => item.key === tabKey);
    if (tabItem) history.push(tabItem.path);
  };

  const handleDocumentPreview = (document: FavoriteDocumentData) => {
    if (document) {
      metrics.track('click-open-document-preview-button');
      setDocumentId(document.id.toString());
    }
  };

  const handleModalClose = () => {
    metrics.track('click-close-document-preview-button');
    setDocumentId('');
  };

  const removeDocument = (document: FavoriteDocumentData) => {
    mutateFavoriteContent({
      id: favoriteId,
      updateData: { removeDocumentIds: [document.id] },
    });
  };

  const handleDocumentsDownload = async (
    selectedDocuments: FavoriteDocumentData[]
  ) => {
    showInfoMessageWithTitle(t(DOWNLOADING), t(DOWNLOAD_MESSAGE));
    if (selectedDocuments && selectedDocuments.length) {
      if (selectedDocuments.length === 1) {
        await downloadFileFromUrl(selectedDocuments[0].id.toString());
      }
      await zipFavoritesAndDownload(selectedDocuments);
    }
  };

  const removeWell = (wellId: number) => {
    mutateFavoriteContent({
      id: favoriteId,
      updateData: {
        wells: content?.wells ? omit(content.wells, [wellId]) : {},
      },
    });
  };

  const showLoadMore =
    !(isDocumentsLoading || isDocumentsIdle) &&
    content &&
    documents.length < content.documentIds.length;

  return (
    <>
      <PageContainer>
        <TabBar data-testid="favorite-details-content-navigation">
          <Tabs activeKey={activeTab} onChange={handleNavigation}>
            <Tabs.TabPane
              key={FavoriteTabs.documents}
              tab={
                <span>
                  Documents
                  {isDocumentsIdle || isDocumentsLoading ? (
                    <Icon type="Loader" style={{ marginLeft: 4 }} />
                  ) : (
                    <Badge text={`${content?.documentIds.length || 0}`} />
                  )}
                </span>
              }
            />
            <Tabs.TabPane
              key={FavoriteTabs.wells}
              tab={
                <span>
                  Wells
                  {isWellsIdle || isWellsLoading ? (
                    <Icon type="Loader" style={{ marginLeft: 4 }} />
                  ) : (
                    <Badge
                      text={`${
                        content?.wells ? Object.keys(content.wells).length : 0
                      }`}
                    />
                  )}
                </span>
              }
            />
          </Tabs>
        </TabBar>

        <React.Suspense fallback={<EmptyState isLoading />}>
          <Switch>
            <Route
              path={navigation.FAVORITE_TAB_DOCUMENTS(favoriteId)}
              render={() => (
                <>
                  <DocumentsTable
                    isFavoriteSetOwner={isOwner(ownerId || '')}
                    removeDocument={removeDocument}
                    handleDocumentPreview={handleDocumentPreview}
                    documentData={documents}
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
              )}
            />
            <Route
              path={navigation.FAVORITE_TAB_WELLS(favoriteId)}
              render={() => (
                <WellsTable
                  removeWell={removeWell}
                  wells={content?.wells}
                  favoriteId={favoriteId}
                />
              )}
            />
          </Switch>
        </React.Suspense>
      </PageContainer>

      <DocumentViewModal
        documentId={documentId || ''}
        onModalClose={handleModalClose}
        modalOpen={!!documentId}
      />
    </>
  );
};
