import React, { useMemo } from 'react';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';

import { zIndex } from '../../utils/zIndex';

import { useOrientation } from './OrientationContext';
import { OrientationTooltip } from './OrientationTooltip';
import { convertSteps } from './utils';

export const Orientation = () => {
  const {
    state: { steps = [], open, enableHotspot },
    handleState,
  } = useOrientation();

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    const options: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (options.includes(status)) {
      handleState({ complete: true, open: false });
    }
  };
  const joyrideSteps = useMemo(
    () => convertSteps(steps, enableHotspot),
    [steps, enableHotspot]
  );

  return (
    <Joyride
      steps={joyrideSteps}
      continuous={!enableHotspot}
      disableCloseOnEsc
      showProgress
      disableScrolling
      disableOverlayClose
      styles={{
        options: {
          arrowColor: 'var(--cogs-decorative--blue--500)',
          zIndex: zIndex.MAXIMUM,
        },
      }}
      run={open}
      floaterProps={{
        styles: {
          arrow: {
            length: 8,
            spread: 16,
          },
        },
      }}
      callback={handleJoyrideCallback}
      tooltipComponent={OrientationTooltip}
    />
  );
};
