import React, { useState, useEffect, useRef, useMemo } from 'react';

import { BotUI } from '@botui/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { createBot } from 'botui';
import styled from 'styled-components/macro';

import { ToastContainer } from '@cognite/cogs.js';
import { FlagProvider } from '@cognite/react-feature-flags';
import { CogniteClient } from '@cognite/sdk';
import { SDKProvider } from '@cognite/sdk-provider';

import { CogniteChainName } from '../lib/toolchains';
import { CopilotSupportedFeatureType } from '../lib/types';

import { ChatUI } from './components/ChatUI';
import { COPILOT_TOGGLE, CopilotButton } from './components/CopilotButton';

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
                excludeChains={memoizedExcludeChains}
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

  .botui_action {
    width: 100%;
    max-width: 100%;
    padding: 7px 14px;
    display: inline-block;

    &.action_input {
      form {
        display: flex;
        justify-content: flex-end;
      }
    }
  }

  .botui_message_content {
    width: auto;
    max-width: 75%;
    overflow: scroll;
    line-height: 1.3;
    padding: 7px 13px;
    border-radius: 15px;
    display: inline-block;
    overflow: auto;
    background: #dadffc;
    overflow: auto;

    &.human {
      align-self: end;
      background: #f5f5f5;
    }

    iframe {
      border: 0;
      width: 100%;
    }
  }

  .botui_app_container {
    width: 100%; // mobile-first
    height: 100%;
    line-height: 1;

    @media (min-width: $botui-width) {
      height: 500px;
      margin: 0 auto;
      width: $botui-width;
    }
  }

  .botui_container {
    width: 100%;
    height: auto;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .botui_message_container {
    width: 100%;
  }

  .botui_message {
    margin: 0;
    margin-bottom: 8px;
    display: flex;
    flex-direction: column;
  }
  .botui_app_container {
    width: 100%;
    overflow: hidden;
    flex: 1;
    position: relative;
    display: flex;
  }
  .botui_message_list {
    padding: 0;
    width: 100%;
  }

  .botui_action_container {
    padding: 0;
    min-height: 104px;
    .botui_action {
      padding: 0;
    }
  }
  .cogs-textarea {
    flex: 1;
    height: 100px;
  }

  .cogs-textarea {
    width: 100%;
    textarea {
      color: black !important;
    }
  }
  pre {
    overflow: hidden;
    margin-bottom: 0;
  }

  /*
  Animation of loading dots
*/
  .loading_dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 0.5rem;
    display: inline-block;
    background-color: $primary-color;

    &:nth-last-child(1) {
      margin-left: 0.3rem;
      animation: loading 0.6s 0.3s linear infinite;
    }
    &:nth-last-child(2) {
      margin-left: 0.3rem;
      animation: loading 0.6s 0.2s linear infinite;
    }
    &:nth-last-child(3) {
      animation: loading 0.6s 0.1s linear infinite;
    }
  }

  @keyframes loading {
    0% {
      transform: translate(0, 0);
      background-color: $primary-color;
    }

    25% {
      transform: translate(0, -3px);
    }
    50% {
      transform: translate(0, 0px);
      background-color: $primary-color;
    }
    75% {
      transform: translate(0, 3px);
    }
    100% {
      transform: translate(0, 0px);
    }
  }

  .slide-fade-enter-done {
    transition: all 0.3s ease;
  }

  .slide-fade-enter,
  .slide-fade-exit-done {
    opacity: 0;
    transform: translateX(-10px);
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
