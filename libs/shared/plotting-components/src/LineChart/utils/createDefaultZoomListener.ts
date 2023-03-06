import { AxisDirection, KeyTriggeredAxisDirection } from '../types';

export const createDefaultZoomListener = (
  axisDirectionConfig: KeyTriggeredAxisDirection | undefined,
  callback: (axisDirection?: AxisDirection) => void
) => {
  const listener = () => {
    callback(axisDirectionConfig?.direction);
  };

  window.addEventListener('keyup', listener);

  return () => window.removeEventListener('keyup', listener);
};
