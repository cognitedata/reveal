import React from 'react';
import { Step } from 'react-joyride';

import { OrientationTooltipContent } from './OrientationTooltip';
import { InternalStep } from './types';

export const convertSteps = (
  steps: InternalStep[],
  enableHotspot?: boolean
): Step[] => {
  return steps.map((step) => {
    const { title, icon, description, ...rest } = step;
    return {
      disableBeacon: !enableHotspot,
      isFixed: true,
      ...rest,
      content: (
        <OrientationTooltipContent
          title={title}
          description={description}
          icon={icon}
        />
      ),
    };
  });
};
