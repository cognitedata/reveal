import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import {
  render as rtlRender,
  configure,
  RenderOptions,
} from '@testing-library/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import { ids } from '../cogs-variables';

configure({});

// eslint-disable-next-line @typescript-eslint/ban-types
const render = <T extends {}>(
  component: React.FC<T>,
  options?: Omit<RenderOptions, 'queries'> & {
    isDesktop?: boolean;
  },
  props?: T
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
        <MemoryRouter>{React.createElement(component, props)}</MemoryRouter>
      </QueryClientProvider>
    </div>,
    options
  );
};

export default render;
