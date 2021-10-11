import React from 'react';
import { Switch, Route, useLocation } from 'react-router-dom';

import { Slider as CommentSlider } from '@cognite/react-comments';

import { SIDECAR } from 'constants/app';
import navigation from 'constants/navigation';
import FavoriteHeader from 'pages/authorized/favorites/header';
import { PageBottomPaddingWrapper } from 'styles/layout';

import { FavoriteContent, SavedSearches } from './tabs';

export const Favorites: React.FC = () => {
  const { pathname } = useLocation();
  return (
    <CommentSlider
      commentServiceBaseUrl={SIDECAR.commentServiceBaseUrl}
      userManagementServiceBaseUrl={SIDECAR.userManagementServiceBaseUrl}
    >
      {({ setCommentTarget }) => {
        return (
          <>
            <FavoriteHeader
              hideActions={pathname === navigation.FAVORITES_SAVED_SEARCH}
            />
            <PageBottomPaddingWrapper>
              <React.Suspense fallback="">
                <Switch>
                  <Route
                    exact
                    path={navigation.FAVORITES_SAVED_SEARCH}
                    render={() => (
                      <SavedSearches setCommentTarget={setCommentTarget} />
                    )}
                  />

                  <Route
                    exact
                    path={navigation.FAVORITES}
                    render={() => (
                      <FavoriteContent setCommentTarget={setCommentTarget} />
                    )}
                  />
                </Switch>
              </React.Suspense>
            </PageBottomPaddingWrapper>
          </>
        );
      }}
    </CommentSlider>
  );
};
