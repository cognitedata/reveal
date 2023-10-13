import styled from 'styled-components';

import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import { ToastContainer } from '@cognite/cogs.js';
import { CogniteClient } from '@cognite/sdk';
import { SDKProvider } from '@cognite/sdk-provider';

import { translations } from '../i18n';

import {
  CopilotContextProvider,
  CopilotContextProviderProps,
} from './context/CopilotContext';

export const Copilot = ({
  children,
  ...props
}: {
  sdk: CogniteClient;
  children?: React.ReactNode;
} & CopilotContextProviderProps) => {
  return (
    <SDKProvider sdk={props.sdk}>
      <I18nWrapper translations={translations} addNamespace="copilot">
        <QueryClientProvider client={queryClient}>
          <ToastContainer />
          <StyledWrapper id="copilot-wrapper">
            <CopilotContextProvider {...props}>
              {children}
            </CopilotContextProvider>
          </StyledWrapper>
        </QueryClientProvider>
      </I18nWrapper>
    </SDKProvider>
  );
};

const StyledWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  .cogs-modal__content {
    height: 100%;
  }
`;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});
