import * as React from 'react';
import { Switch, Route } from 'react-router-dom';

import { Slider as CommentSlider } from '@cognite/react-comments';

import { SIDECAR } from 'constants/app';
import navigation from 'constants/navigation';
import FavoriteHeader from 'pages/authorized/favorites/header';
import { FlexColumn, PageBottomPaddingWrapper } from 'styles/layout';

import { FavoriteContent, SavedSearches } from './tabs';
import { FavoriteDetails } from './tabs/favorites/detailsPage';

export const Favorites: React.FC = () => {
  return (
    <CommentSlider
      commentServiceBaseUrl={SIDECAR.commentServiceBaseUrl}
      userManagementServiceBaseUrl={SIDECAR.userManagementServiceBaseUrl}
    >
      {({ setCommentTarget, commentTarget }) => {
        return (
          <FlexColumn style={{ minHeight: '100%' }}>
            <React.Suspense fallback="">
              {/* header should NOT show for the FAVORITES_DETAILS route */}
              <Switch>
                <Route
                  exact
                  path={navigation.FAVORITES}
                  render={() => <FavoriteHeader hideActions={false} />}
                />
                <Route
                  exact
                  path={navigation.FAVORITES_SAVED_SEARCH}
                  render={() => <FavoriteHeader hideActions />}
                />
              </Switch>
            </React.Suspense>
            <PageBottomPaddingWrapper>
              <React.Suspense fallback="">
                <Switch>
                  <Route
                    exact
                    path={navigation.FAVORITES_DETAILS}
                    render={() => (
                      <FavoriteDetails setCommentTarget={setCommentTarget} />
                    )}
                  />
                  <Route
                    exact
                    path={navigation.FAVORITES_SAVED_SEARCH}
                    render={() => (
                      <SavedSearches
                        setCommentTarget={setCommentTarget}
                        commentTarget={commentTarget}
                      />
                    )}
                  />
                  <Route
                    exact
                    path={navigation.FAVORITES}
                    render={() => (
                      <FavoriteContent
                        setCommentTarget={setCommentTarget}
                        commentTarget={commentTarget}
                      />
                    )}
                  />
                </Switch>
              </React.Suspense>
            </PageBottomPaddingWrapper>
          </FlexColumn>
        );
      }}
    </CommentSlider>
  );
};
