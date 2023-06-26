import React from 'react';

import '@cognite/cogs.js/dist/cogs.css';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';

import { RootApp } from '../../App';
import { translations } from '../../app/common/i18n';

import { AuthContainerMock } from './AuthContainerMock';

export const AppWrapper = () => {
  const projectName = 'charts';

  return (
    <I18nWrapper translations={translations} defaultNamespace={projectName}>
      <AuthContainerMock>
        <RootApp />
      </AuthContainerMock>
    </I18nWrapper>
  );
};
