/* eslint-disable jest/no-mocks-import */
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { styleScope } from 'src/utils/utils';
import { SDKProvider } from '@cognite/sdk-provider';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ClassifierContext } from 'src/machines/classifier/contexts/ClassifierContext';
import { mockSdk } from '../../__mocks__/sdk';

const queryClient = new QueryClient();
export const TestProviderWrapper: React.FC = ({ children }) => (
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
