import React, { useState, useEffect, useRef } from 'react';

import { BotUI } from '@botui/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { createBot } from 'botui';
import styled from 'styled-components/macro';

import { ToastContainer } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';
import { CogniteClient } from '@cognite/sdk';
import { SDKProvider } from '@cognite/sdk-provider';

import { CopilotSupportedFeatureType } from '../lib/types';

import { ChatUI } from './components/ChatUI';
import { COPILOT_TOGGLE, CopilotButton } from './components/CopilotButton';

export const Copilot = ({
  feature,
  sdk,
}: {
  feature?: CopilotSupportedFeatureType;
  sdk: CogniteClient;
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

  const bot = useRef(createBot());

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
            <BotUI bot={bot.current}>
              <ChatUI
                visible={isVisible}
                feature={feature}
                onClose={() => {
                  window.dispatchEvent(
                    new CustomEvent(COPILOT_TOGGLE, {
                      detail: { active: false },
                    })
                  );
                }}
              />
            </BotUI>
            <CopilotButton />
          </FlagProvider>
        </StyledWrapper>
      </QueryClientProvider>
    </SDKProvider>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  flex-flow: column;
  height: 0;
  overflow: hidden;

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
