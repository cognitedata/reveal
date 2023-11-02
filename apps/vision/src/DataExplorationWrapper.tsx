import React from 'react';

import sdk, { getFlow } from '@cognite/cdf-sdk-singleton';
import { DataExplorationProvider } from '@cognite/data-exploration';

import { ids } from './cogs-variables';
import { useUserInformation } from './hooks/useUserInformation';

export const DataExplorationWrapper = ({ children }: { children: any }) => {
  const { flow } = getFlow();
  const { data: userInfo } = useUserInformation();

  if (!flow) {
    throw new Error('Flow is not defined');
  }

  return (
    <DataExplorationProvider
      flow={flow}
      userInfo={userInfo}
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
