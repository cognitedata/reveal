import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import { ToastContainer } from '@cognite/cogs.js';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import { Copilot } from './pages/Copilot';

const COPILOT_TOGGLE = 'COPILOT_TOGGLE';

function App() {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const listener = (ev: MessageEvent) => {
      if (
        ev.data &&
        typeof ev.data === 'object' &&
        'type' in ev.data &&
        ev.data.type === COPILOT_TOGGLE &&
        'active' in ev.data
      ) {
        setIsVisible(ev.data.active);
      }
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
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
