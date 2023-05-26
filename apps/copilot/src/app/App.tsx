import React, { useEffect, useState } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import styled from 'styled-components/macro';

import { ToastContainer } from '@cognite/cogs.js';

import { Copilot } from './pages/Copilot';
import { queryClient } from './queryClient';

const COPILOT_TOGGLE = 'COPILOT_TOGGLE';

function App() {
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
      <ReactQueryDevtools initialIsOpen={false} />
      <ToastContainer />
      <StyledWrapper>{isVisible && <Copilot />}</StyledWrapper>
    </QueryClientProvider>
  );
}

export default App;

const StyledWrapper = styled.div`
  display: flex;
  flex-flow: column;
  height: 100%;
  overflow: hidden;
`;
