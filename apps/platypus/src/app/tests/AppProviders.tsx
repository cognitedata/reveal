import React from 'react';

import { BrowserRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { I18nContainer } from '@cognite/react-i18n';
import { StoreType } from '@platypus-app/redux/store';

export type Props = {
  store: StoreType;
  children: React.ReactNode;
  tenant: string;
};

const AppProviders = ({ store, children, tenant }: Props) => {
  return (
    <ReduxProvider store={store}>
      <I18nContainer>
        <BrowserRouter basename={`/${tenant}`}>{children}</BrowserRouter>
      </I18nContainer>
    </ReduxProvider>
  );
};

export default AppProviders;
