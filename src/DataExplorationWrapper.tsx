import React from 'react';
import sdk, { getFlow } from '@cognite/cdf-sdk-singleton';
import { useUserInformation } from './hooks/useUserInformation';
import { ids } from './cogs-variables';
import { DataExplorationProvider } from '@cognite/data-exploration';

export const DataExplorationWrapper = ({ children }: { children: any }) => {
  const { flow } = getFlow();
  const { data: userInfo } = useUserInformation();
  return (
    <DataExplorationProvider
      flow={flow}
      userInfo={userInfo}
      // @ts-ignore:next-line
      sdk={sdk}
      styleScopeId={ids.styleScope}
      overrideURLMap={{
        pdfjsWorkerSrc:
          '/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.min.js',
      }}
    >
      {children}
    </DataExplorationProvider>
  );
};
