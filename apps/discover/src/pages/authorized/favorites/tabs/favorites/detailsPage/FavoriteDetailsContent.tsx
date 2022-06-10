import { useDocumentsByIdForFavoritesQuery } from 'domain/documents/internal/queries/useDocumentsByIdForFavoritesQuery';

import * as React from 'react';
import { Switch, Route, useHistory, useLocation } from 'react-router-dom';

import { Badge, Icon, Tabs } from '@cognite/cogs.js';
import { FavoriteContent } from '@cognite/discover-api-types';

import DocumentViewModal from 'components/DocumentPreview/DocumentViewModal';
import EmptyState from 'components/EmptyState';
import navigation from 'constants/navigation';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useWellsCacheQuery } from 'modules/wellSearch/hooks/useWellsCacheQuery';
import { NavigationTab } from 'pages/types';

import { PageContainer } from '../../../elements';
import { TabBar } from '../elements';

import { WellsTable } from './content';
import { FavoriteDocumentsList } from './FavoriteDocumentsList';

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
  const { isLoading: isDocumentsLoading, isIdle: isDocumentsIdle } =
    useDocumentsByIdForFavoritesQuery(content?.documentIds);

  const { isLoading: isWellsLoading, isIdle: isWellsIdle } = useWellsCacheQuery(
    content?.wells ? Object.keys(content.wells) : []
  );
  const [showingDocumentPreviewId, setShowingDocumentPreviewId] =
    React.useState<string | undefined>(undefined);

  const { pathname } = useLocation();
  const history = useHistory();
  const metrics = useGlobalMetrics('favorites');

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

  const activeTab = React.useMemo(
    () => navigationTabItems.find((y) => y.path === pathname)?.key,
    [pathname]
  );

  const handleNavigation = (tabKey: string) => {
    metrics.track(`click-${tabKey.toLowerCase()}-tab`);

    const tabItem = navigationTabItems.find((item) => item.key === tabKey);
    if (tabItem) history.push(tabItem.path);
  };

  const handleModalClose = () => {
    metrics.track('click-close-document-preview-button');
    setShowingDocumentPreviewId('');
  };

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
                <FavoriteDocumentsList
                  favoriteId={favoriteId}
                  ownerId={ownerId}
                  documentIds={content?.documentIds}
                  previewDocument={setShowingDocumentPreviewId}
                />
              )}
            />
            <Route
              path={navigation.FAVORITE_TAB_WELLS(favoriteId)}
              render={() => (
                <WellsTable wells={content?.wells} favoriteId={favoriteId} />
              )}
            />
          </Switch>
        </React.Suspense>
      </PageContainer>

      <DocumentViewModal
        documentId={showingDocumentPreviewId || ''}
        onModalClose={handleModalClose}
        modalOpen={!!showingDocumentPreviewId}
      />
    </>
  );
};
