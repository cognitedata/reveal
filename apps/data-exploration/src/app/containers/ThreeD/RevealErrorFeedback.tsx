import { FallbackProps } from 'react-error-boundary';

import { Alert, Button } from 'antd';

import { useTranslation } from '@data-exploration-lib/core';

export default function RevealErrorFeedback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  const { t } = useTranslation();
  return (
    <Alert
      message={t('REVEAL_ERROR', 'Reveal error')}
      description={t(
        'REVEAL_COMPONENT_ERROR',
        `Reveal component threw an error:\n${JSON.stringify(error, null, 2)}`,
        { error: JSON.stringify(error, null, 2) }
      )}
      action={
        <Button onClick={resetErrorBoundary}>{t('RESET', 'Reset')}</Button>
      }
    />
  );
}
