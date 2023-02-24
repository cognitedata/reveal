import { LayoutAxis } from 'plotly.js';
import { Axis } from '../types';

export const getCommonAxisLayoutProps = (
  axis: Axis | undefined,
  showAxisName: boolean
): Partial<LayoutAxis> => {
  return {
    title: showAxisName ? { text: axis?.name } : undefined,
    nticks: axis?.ticksCount,
    dtick: axis?.tickDistance,
    automargin: true,
    zeroline: false,
    showline: true,
    mirror: true,
  };
};
