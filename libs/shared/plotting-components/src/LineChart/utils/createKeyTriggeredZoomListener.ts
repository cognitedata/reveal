import { AxisDirection, KeyTriggeredAxisDirection } from '../types';

export const createKeyTriggeredZoomListener = (
  axisDirectionConfig: KeyTriggeredAxisDirection,
  callback: (axisDirection: AxisDirection) => void
) => {
  const { trigger, direction } = axisDirectionConfig;

  const listener = (event: KeyboardEvent) => {
    if (event.key === trigger) {
      callback(direction);
    }
  };

  window.addEventListener('keydown', listener);

  return () => window.removeEventListener('keydown', listener);
};
