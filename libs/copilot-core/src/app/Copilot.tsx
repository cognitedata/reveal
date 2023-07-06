import React, { useState, useEffect, useMemo } from 'react';

import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import styled from 'styled-components/macro';

import { ToastContainer } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';
import { CogniteClient } from '@cognite/sdk';
import { SDKProvider } from '@cognite/sdk-provider';

import { CogniteChainName } from '../lib/toolchains';
import { CopilotSupportedFeatureType } from '../lib/types';

import { ChatUI } from './components/ChatUI';
import { COPILOT_TOGGLE, CopilotButton } from './components/CopilotButton';
import { CopilotContextProvider } from './utils/CopilotContext';

export const Copilot = ({
  feature,
  sdk,
  excludeChains = [],
}: {
  feature?: CopilotSupportedFeatureType;
  sdk: CogniteClient;
  excludeChains?: CogniteChainName[];
}) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const listener = (ev: Event) => {
      if ('detail' in ev) {
        const toggleEvent = ev as CustomEvent<{ active?: boolean }>;
        if ('active' in toggleEvent.detail) {
          setIsVisible(toggleEvent.detail.active || false);
        }
      }
    };
    window.addEventListener(COPILOT_TOGGLE, listener);
    return () => {
      window.removeEventListener(COPILOT_TOGGLE, listener);
    };
  }, []);

  const stringifiedExclusionList = useMemo(
    () => JSON.stringify(excludeChains),
    [excludeChains]
  );

  const memoizedExcludeChains = useMemo(
    () => JSON.parse(stringifiedExclusionList) as CogniteChainName[],
    [stringifiedExclusionList]
  );

  return (
    <SDKProvider sdk={sdk}>
      <QueryClientProvider client={queryClient}>
        <ToastContainer />
        <StyledWrapper id="copilot-wrapper">
          <FlagProvider
            apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
            appName="copilot"
            projectName={sdk.project}
            remoteAddress={window.location.hostname}
            disableMetrics
          >
            <CopilotContextProvider>
              <>
                <ChatUI
                  visible={isVisible}
                  excludeChains={memoizedExcludeChains}
                  feature={feature}
                />
                <CopilotButton />
              </>
            </CopilotContextProvider>
          </FlagProvider>
        </StyledWrapper>
      </QueryClientProvider>
    </SDKProvider>
  );
};

const StyledWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-flow: column;
  height: 0;
  overflow: hidden;
  z-index: ${1};

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
