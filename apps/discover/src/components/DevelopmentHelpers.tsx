// import * as React from 'react';

import layers from 'utils/zindex';

import { isLocalhost } from '@cognite/react-container';
import { ErrorWatcher } from '@cognite/react-errors';

// import { showInfiniteToast } from 'components/Toast';
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
      </>
    );
  }

  return null;
};
