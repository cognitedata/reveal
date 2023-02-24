import { DEFAULT_MARGIN } from '../constants';

export const getMarginValue = (
  showAxisName: boolean,
  showTickLabels: boolean
) => {
  if (showAxisName && showTickLabels) {
    return 50;
  }

  if (!showAxisName && showTickLabels) {
    return 0;
  }

  return DEFAULT_MARGIN;
};
