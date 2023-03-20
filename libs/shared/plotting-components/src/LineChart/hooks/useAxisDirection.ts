import { useEffect, useState } from 'react';

import isArray from 'lodash/isArray';

import { AxisDirection, AxisDirectionConfig } from '../types';
import { createEventListener } from '../utils/createEventListener';

export const useAxisDirection = (axisDirectionConfig: AxisDirectionConfig) => {
  const [direction, setDirection] = useState<AxisDirection>();

  useEffect(() => {
    if (axisDirectionConfig === false) {
      setDirection(undefined);
      return;
    }

    if (!isArray(axisDirectionConfig)) {
      setDirection(axisDirectionConfig);
      return;
    }

    window.focus();

    const unsubscribeListeners = axisDirectionConfig.map(
      ({ trigger, direction }) => {
        const type = trigger === 'default' ? 'keyup' : 'keydown';

        return createEventListener(window, type, () => {
          setDirection(direction);
        });
      }
    );

    return () => {
      unsubscribeListeners.forEach((unsubscribeListener) => {
        unsubscribeListener();
      });
    };
  }, [axisDirectionConfig]);

  return direction;
};
