import React, { useState, useEffect } from 'react';

import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import styled from 'styled-components/macro';

import { ToastContainer } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';

import { CopilotSupportedFeatureType } from '../lib/types';

import { ChatUI } from './components/ChatUI';
import { COPILOT_TOGGLE, CopilotButton } from './components/CopilotButton';

export const Copilot = ({
  project,
  feature,
}: {
  project: string;
  feature?: CopilotSupportedFeatureType;
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

  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer />
      <StyledWrapper>
        <FlagProvider
          apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
          appName="copilot"
          projectName={project}
          remoteAddress={window.location.hostname}
          disableMetrics
        >
          {feature && isVisible && (
            <ChatUI
              feature={feature}
              onClose={() => {
                window.dispatchEvent(
                  new CustomEvent(COPILOT_TOGGLE, {
                    detail: { active: false },
                  })
                );
              }}
            />
          )}
          {feature && <CopilotButton />}
        </FlagProvider>
      </StyledWrapper>
    </QueryClientProvider>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  flex-flow: column;
  height: 100%;
  overflow: hidden;
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
