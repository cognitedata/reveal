import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import {
  render as rtlRender,
  configure,
  RenderOptions,
} from '@testing-library/react';
import { QueryClientProvider, QueryClient } from 'react-query';

import { ids } from 'cogs-variables';

configure({});

const render = (
  component: React.ReactNode,
  options?: Omit<RenderOptions, 'queries'> & {
    isDesktop?: boolean;
  }
) => {
  const setMockedWidth = (isDesktop: boolean) => {
    global.innerWidth = isDesktop ? 1024 : 420;
  };

  if (options && options.isDesktop !== undefined) {
    setMockedWidth(options.isDesktop);
  }

  const client = new QueryClient();

  return rtlRender(
    <div className={ids.styleScope}>
      <QueryClientProvider client={client}>
        <MemoryRouter>{component}</MemoryRouter>
      </QueryClientProvider>
    </div>,
    options
  );
};

export default render;
