import React from 'react';

import { useTranslation } from '../../common';

import { ErrorFeedback } from './ErrorFeedback';

export const ErrorComponent = ({
  handleErrorDialogClick,
  error,
  tabKey,
}: {
  tabKey?: string;
  error: { status?: number };
  handleErrorDialogClick: () => void;
}) => {
  const { t } = useTranslation();
  if (error?.status === 403) {
    return (
      <ErrorFeedback
        onClick={handleErrorDialogClick}
        fallbackTitle={t('list-extraction-pipelines-error-403', {
          context: tabKey,
        })}
        btnText="Retry"
      />
    );
  }
  return (
    <ErrorFeedback
      btnText="Retry"
      onClick={handleErrorDialogClick}
      fallbackTitle={t('fail-to-get-ext-pipeline')}
      contentText={t('try-again-later')}
      error={error}
    />
  );
};
