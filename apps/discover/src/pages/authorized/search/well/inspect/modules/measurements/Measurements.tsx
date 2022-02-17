import React from 'react';

import { useEnabledWellSdkV3 } from 'modules/wellSearch/hooks/useEnabledWellSdkV3';

import { Measurements as MeasurementsV2 } from './v2/Measurements';
import { Measurements as MeasurementsV3 } from './v3/Measurements';

export const Measurements: React.FC = () => {
  const wellSdkV3Enabled = useEnabledWellSdkV3();

  if (wellSdkV3Enabled) {
    return (
      <>
        <MeasurementsV3 />
      </>
    );
  }

  return <MeasurementsV2 />;
};

export default Measurements;
