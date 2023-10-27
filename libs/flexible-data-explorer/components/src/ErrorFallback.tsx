import React from 'react';

import styled from 'styled-components';

import { useTranslation } from '@fdx/shared/hooks/useTranslation';
import * as Sentry from '@sentry/react';

import { Button, EmptyState, Flex } from '@cognite/cogs.js';

interface Props {
  error: Error;
  eventId: string;
  onResetClick?: () => void;
}

export const ErrorFallback: React.FC<Props> = ({
  error,
  eventId,
  onResetClick,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(false);

  return (
    <Container>
      <EmptyState
        illustration="EmptyStateFileSad"
        illustrationColor="red"
        title={t('ERROR_TITLE')}
        body={error.toString()}
        href=""
        target="_blank"
      />

      <Flex gap={8}>
        <Button
          icon="Home"
          onClick={() => {
            window.open('/', '_self');
          }}
        >
          {t('ERROR_BACK_TO_HOME')}
        </Button>
        <Button
          type="primary"
          icon="Refresh"
          onClick={() => {
            onResetClick?.();
          }}
        >
          {t('ERROR_RETRY')}
        </Button>
      </Flex>
      <Button
        type="ghost-accent"
        disabled={loading}
        loading={loading}
        onClick={() => {
          setLoading(true);

          Sentry.showReportDialog({
            eventId: eventId,
            title: t('ERROR_FEEDBACK_TITLE'),
            subtitle: t('ERROR_FEEDBACK_SUBTITLE'),
            subtitle2: t('ERROR_FEEDBACK_SUBTITLE2'),
            labelName: t('ERROR_FEEDBACK_LABEL_NAME'),
            labelEmail: t('ERROR_FEEDBACK_LABEL_EMAIL'),
            labelComments: t('ERROR_FEEDBACK_LABEL_COMMENTS'),
            labelSubmit: t('ERROR_FEEDBACK_LABEL_SUBMIT'),
            labelClose: t('ERROR_FEEDBACK_LABEL_CLOSE'),
            errorFormEntry: t('ERROR_FEEDBACK_FORM_ENTRY_ERROR'),
            successMessage: t('ERROR_FEEDBACK_SUCCESS_MESSAGE'),
            onLoad: () => {
              setLoading(false);
            },
          });
        }}
      >
        {t('ERROR_FEEDBACK_BUTTON')}
      </Button>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
  background: linear-gradient(
      0deg,
      rgba(235, 238, 247, 0.35) 0%,
      rgba(235, 238, 247, 0.35) 100%
    ),
    #fff;
`;
