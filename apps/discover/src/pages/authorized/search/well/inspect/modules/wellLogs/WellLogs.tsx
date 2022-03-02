import React from 'react';

import { useEnabledWellSdkV3 } from 'modules/wellSearch/hooks/useEnabledWellSdkV3';

import WellLogsTableOld from './v2/LogType';
import { WellLogsTable } from './v3/WellLogsTable';

export const WellLogs: React.FC = () => {
  const wellSdkV3Enabled = useEnabledWellSdkV3();

  if (wellSdkV3Enabled) {
    return <WellLogsTable />;
  }

  return <WellLogsTableOld />;
};

export default WellLogs;
