import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRenderTargetMock } from './renderTarget';
import { sdkMock } from './sdk';
import { SDKProvider } from '../../../src/components/RevealCanvas/SDKProvider';
import { ViewerContextProvider } from '../../../src/components/RevealCanvas/ViewerContext';

const queryClient = new QueryClient();
const renderTargetMock = createRenderTargetMock();

export const wrapper = ({ children }: { children: any }): any => (
  <SDKProvider sdk={sdkMock}>
    <QueryClientProvider client={queryClient}>
      <ViewerContextProvider value={renderTargetMock}>{children}</ViewerContextProvider>
    </QueryClientProvider>
  </SDKProvider>
);
