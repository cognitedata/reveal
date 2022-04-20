import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Route,
  Redirect,
  Switch,
  useHistory,
  useLocation,
} from 'react-router-dom';

import { SegmentedControl } from '@cognite/cogs.js';
import { Slider as CommentSlider } from '@cognite/react-comments';

import { SIDECAR } from 'constants/app';
import navigation from 'constants/navigation';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { NavigationTab } from 'pages/types';

import { ViewArchivedFeedback } from './common/ViewArchivedFeedback';
import DocumentFeedback from './document-feedback';
import { TabBar, FeedbackContent } from './elements';
import GeneralFeedback from './general-feedback';

enum FeedbackTabs {
  'general',
  'document',
}

const navigationTabItems: NavigationTab[] = [
  {
    key: `${FeedbackTabs.general}`,
    name: 'General Feedback',
    path: navigation.ADMIN_FEEDBACK_GENERAL,
  },
  {
    key: `${FeedbackTabs.document}`,
    name: 'Document Feedback',
    path: navigation.ADMIN_FEEDBACK_DOCUMENT,
  },
];

export const Feedback = () => {
  const { t } = useTranslation('admin');
  const metrics = useGlobalMetrics('admin');
  const location = useLocation();
  const history = useHistory();
  const selectedItem = React.useMemo(
    () => navigationTabItems.find((y) => y.path === location.pathname)?.key,
    [location.pathname]
  );

  return (
    <CommentSlider
      commentServiceBaseUrl={SIDECAR.commentServiceBaseUrl}
      userManagementServiceBaseUrl={SIDECAR.userManagementServiceBaseUrl}
      fasAppId={SIDECAR.aadApplicationId}
    >
      {({ setCommentTarget, commentTarget }) => {
        const handleNavigation = (tabKey: string) => {
          const tabItem = navigationTabItems.find(
            (item) => item.key === tabKey
          );

          metrics.track(`click-navigate-to-${tabKey}-page-tab`);

          if (tabItem) {
            history.push(tabItem.path);
            setCommentTarget(undefined);
          }
        };
        return (
          <FeedbackContent>
            <TabBar>
              <div>
                <SegmentedControl
                  currentKey={selectedItem}
                  onButtonClicked={handleNavigation}
                >
                  <SegmentedControl.Button key={FeedbackTabs.general}>
                    {t('General Feedback')}
                  </SegmentedControl.Button>
                  <SegmentedControl.Button key={FeedbackTabs.document}>
                    {t('Document Feedback')}
                  </SegmentedControl.Button>
                </SegmentedControl>
              </div>
              <div>
                <ViewArchivedFeedback />
              </div>
            </TabBar>
            <Switch>
              <Route
                path={navigation.ADMIN_FEEDBACK_GENERAL}
                render={() => (
                  <GeneralFeedback
                    setCommentTarget={setCommentTarget}
                    commentTarget={commentTarget}
                  />
                )}
              />
              <Route
                path={navigation.ADMIN_FEEDBACK_DOCUMENT}
                render={() => (
                  <DocumentFeedback
                    setCommentTarget={setCommentTarget}
                    commentTarget={commentTarget}
                  />
                )}
              />
              <Redirect
                from={navigation.ADMIN}
                to={navigation.ADMIN_FEEDBACK_GENERAL}
              />
            </Switch>
          </FeedbackContent>
        );
      }}
    </CommentSlider>
  );
};

export default Feedback;
