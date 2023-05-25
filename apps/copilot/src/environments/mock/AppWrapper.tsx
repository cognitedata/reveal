import React from 'react';
import '@cognite/cogs.js/dist/cogs.css';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';

import App from '../../app/App';
import { translations } from '../../app/common';
import { AuthContainerMock } from './AuthContainerMock';

export const AppWrapper = () => {
  const projectName = 'copilot';

  return (
    <I18nWrapper translations={translations} defaultNamespace={projectName}>
      <AuthContainerMock>
        <App />
      </AuthContainerMock>
    </I18nWrapper>
  );
};
