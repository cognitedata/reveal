import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'store';
import { Provider as ReduxProvider } from 'react-redux';
import { PartialRootState } from 'store/types';
import { ErrorBoundary, reportException } from '@cognite/react-errors';
import { I18nContainer } from '@cognite/react-i18n';
import { LoopDetector } from '@cognite/react-loop-detector';
import { ToastContainer } from '@cognite/cogs.js';

type Props = {
  children: React.ReactNode;
  tenant: string;
  initialState?: PartialRootState;
};

const AppProviders = ({ tenant, children, initialState = {} }: Props) => {
  const store = configureStore(initialState);

  return (
    <LoopDetector
      onLoopDetected={(records) => {
        reportException(new Error('Login loop detected'), { records }).finally(
          () => {
            window.location.href =
              'https://docs.cognite.com/dev/guides/iam/external-application.html';
          }
        );
      }}
    >
      <ReduxProvider store={store}>
        <I18nContainer>
          <ErrorBoundary instanceId="charts">
            <ToastContainer />
            <BrowserRouter basename={`/${tenant}`}>{children}</BrowserRouter>
          </ErrorBoundary>
        </I18nContainer>
      </ReduxProvider>
    </LoopDetector>
  );
};

export default AppProviders;
