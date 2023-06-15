import { ReactNode, useEffect, useState } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common/i18n';
import {
  TRANSFORMATION_SURVEY_LINK,
  getLocalStorageState,
  setLocalStorageState,
  getTrackEvent,
} from '@transformations/utils';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { GetFeedback } from '@cognite/cdf-utilities';
import { Title } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

export type PageProps = {
  children: ReactNode;
  className?: string;
  title: string;
};

const Page = ({ children, className, title }: PageProps): JSX.Element => {
  const { t } = useTranslation();
  const { isEnabled: isFeedbackEnabled } = useFlag('TRANSFORMATION_SURVEY', {
    fallback: false,
    forceRerender: true,
  });
  const [feedbackInfoOpen, setFeedbackInfo] = useState<string>(
    () => getLocalStorageState('shouldTransformDataFeedbackOpen') || 'true'
  );

  useEffect(() => {
    if (getLocalStorageState('shouldTransformDataFeedbackOpen') === null) {
      setLocalStorageState('shouldTransformDataFeedbackOpen', 'true');
    }
  }, []);

  const giveFeedbackHandler = () => {
    trackEvent(getTrackEvent('event-tr-release-open-survey-click'));
    window.open(TRANSFORMATION_SURVEY_LINK, '_blank');
  };

  const closeFeedbackHandler = (isNeverShowAgainEnabled: boolean) => {
    trackEvent(getTrackEvent('event-tr-release-close-survey-click'));
    setFeedbackInfo('false');
    if (isNeverShowAgainEnabled) {
      trackEvent(getTrackEvent('event-tr-release-dont-show-survey-click'));
      setLocalStorageState('shouldTransformDataFeedbackOpen', 'false');
    }
  };

  return (
    <StyledPage className={className}>
      {isFeedbackEnabled && (
        <GetFeedback
          open={feedbackInfoOpen}
          title={t('feedback-info-title')}
          description={t('feedback-info-desc')}
          giveFeedbackLabel={t('feedback-action-label')}
          neverShowAgainLabel={t('feedback-never-show-again')}
          onGiveFeedback={giveFeedbackHandler}
          onClose={closeFeedbackHandler}
        />
      )}
      <Title level={3}>{title}</Title>
      <StyledPageContent>{children}</StyledPageContent>
    </StyledPage>
  );
};

const StyledPage = styled.div`
  padding: 24px 40px;
`;
const StyledPageContent = styled.div`
  margin-top: 40px;
`;

export default Page;
