import { useEffect, useState } from 'react';

import isArray from 'lodash/isArray';

import { AxisDirection, AxisDirectionConfig } from '../types';
import { createKeyTriggeredZoomListener } from '../utils/createKeyTriggeredZoomListener';
import { createDefaultZoomListener } from '../utils/createDefaultZoomListener';

export const useAxisDirection = (axisDirectionConfig: AxisDirectionConfig) => {
  const [direction, setDirection] = useState<AxisDirection>();

  useEffect(() => {
    if (axisDirectionConfig === false) {
      setDirection(undefined);
      return;
    }

    if (!isArray(axisDirectionConfig)) {
      setDirection(axisDirectionConfig);
    } else {
      window.focus();

      for (const axisDirectionConfigItem of axisDirectionConfig) {
        if (axisDirectionConfigItem.trigger === 'default') {
          continue;
        }
        createKeyTriggeredZoomListener(axisDirectionConfigItem, setDirection);
      }

      const defaultAxisDirectionConfig = axisDirectionConfig.find(
        ({ trigger }) => trigger === 'default'
      );
      createDefaultZoomListener(defaultAxisDirectionConfig, setDirection);
      setDirection(defaultAxisDirectionConfig?.direction);
    }
  }, [axisDirectionConfig]);

  return direction;
};
