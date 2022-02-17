import React from 'react';

import { useEnabledWellSdkV3 } from 'modules/wellSearch/hooks/useEnabledWellSdkV3';

import LogTypeV2 from './v2/LogType';
import LogTypeV3 from './v3/LogType';

export const LogType: React.FC = () => {
  const enabledWellSDKV3 = useEnabledWellSdkV3();

  return enabledWellSDKV3 ? <LogTypeV3 /> : <LogTypeV2 />;
};

export default LogType;
