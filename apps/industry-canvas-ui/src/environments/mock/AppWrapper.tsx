import React from 'react';
import { AuthContainerMock } from './AuthContainerMock';
import '@cognite/cogs.js/dist/cogs.css';
import App from '../../app/App';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import { translations } from '../../app/common/i18n';

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
