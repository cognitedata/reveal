import { DEFAULT_MARGIN } from '../constants';
import { Layout } from '../types';
import { getMarginValue } from './getMarginValue';

export const getMarginLayout = (layout: Layout = {}) => {
  const { showAxisNames, showTickLabels } = layout;

  return {
    t: DEFAULT_MARGIN,
    r: DEFAULT_MARGIN,
    l: getMarginValue(showAxisNames, showTickLabels),
    b: getMarginValue(showAxisNames, showTickLabels),
  };
};
