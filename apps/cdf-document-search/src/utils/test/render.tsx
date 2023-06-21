import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react';

import { SDKProvider } from '@cognite/sdk-provider';

import { mockSdk } from '../../__mocks__/sdk';
import { ClassifierContext } from '../../machines/classifier/contexts/ClassifierContext';
import { styleScope } from '../utils';

const queryClient = new QueryClient();
export const TestProviderWrapper: React.FC<React.PropsWithChildren> = ({
  children,
}) => (
  <QueryClientProvider client={queryClient}>
    <SDKProvider sdk={mockSdk}>
      <ClassifierContext>{children}</ClassifierContext>
    </SDKProvider>
  </QueryClientProvider>
);

export const testRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) => {
  // This is where you can wrap your rendered UI component in redux stores,
  // providers, or anything else you might want.
  const component = (
    <TestProviderWrapper>
      <div className={styleScope}>{ui}</div>
    </TestProviderWrapper>
  );

  return render(component, options);
};
