// import React from 'react';

import { ReactQueryDevtools } from 'react-query/devtools';

import { isLocalhost } from '@cognite/react-container';
import { ErrorWatcher } from '@cognite/react-errors';

import layers from '_helpers/zindex';
// import { showInfiniteToast } from 'components/toast';
// import { SIDECAR } from 'constants/app';

export const DevelopmentHelpers = () => {
  // React.useEffect(() => {
  //   if (isLocalhost()) {
  //     const clusterName =
  //       SIDECAR.cdfCluster === '' ||
  //       SIDECAR.cdfCluster === 'ew1' ||
  //       SIDECAR.cdfCluster === 'api'
  //         ? 'EW1'
  //         : SIDECAR.cdfCluster;

  //     showInfiniteToast({
  //       type: 'default',
  //       message: `Development environment: ${clusterName}`,
  //       position: 'bottom-right',
  //     });
  //   }
  // }, []);

  if (isLocalhost()) {
    return (
      <>
        <ErrorWatcher errorMode="flash" zIndex={layers.MAXIMUM} />
        <ReactQueryDevtools position="bottom-right" initialIsOpen={false} />
      </>
    );
  }

  return null;
};
