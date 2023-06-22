import React from 'react';

import '@cognite/cogs.js/dist/cogs.css';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';

import App from '../../App';
import { translations } from '../../common/i18n';

import { AuthContainerMock } from './AuthContainerMock';

export const AppWrapper = () => {
  const projectName = 'industry-canvas-ui';

  return (
    <I18nWrapper translations={translations} defaultNamespace={projectName}>
      <AuthContainerMock>
        <App />
      </AuthContainerMock>
    </I18nWrapper>
  );
};
