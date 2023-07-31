import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from '@cognite/cogs.js';

import { ErrorPageContainer } from './elements';

export const ErrorPage: React.FC = () => {
  const { t } = useTranslation();

  const reloadPage = () => {
    // eslint-disable-next-line no-self-assign
    window.location.href = window.location.href;
  };

  return (
    <ErrorPageContainer>
      <header>
        <Trans t={t} i18nKey="ohNo">
          Oh no!
        </Trans>{' '}
        :(
      </header>
      <p data-testid="error-message">
        <Trans t={t} i18nKey="errorMsg">
          You have encountered an internal error.
        </Trans>
      </p>
      <p data-testid="reload-message">
        <Trans t={t} i18nKey="reloadPage">
          Please try{' '}
          <Button type="link" onClick={reloadPage}>
            reloading the page
          </Button>{' '}
          to try again.
        </Trans>
      </p>
    </ErrorPageContainer>
  );
};
