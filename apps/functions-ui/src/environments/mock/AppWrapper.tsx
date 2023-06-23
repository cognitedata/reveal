import React from 'react';
import '@cognite/cogs.js/dist/cogs.css';

import App from '@functions-ui/app/App';
import { translations } from '@functions-ui/app/common';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';

import { AuthContainerMock } from './AuthContainerMock';

export const AppWrapper = () => {
  const projectName = 'functions-ui';

  return (
    <I18nWrapper translations={translations} defaultNamespace={projectName}>
      <AuthContainerMock>
        <App />
      </AuthContainerMock>
    </I18nWrapper>
  );
};
