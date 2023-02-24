import { Layout, Variant } from '../types';

export const getLayout = (
  variant?: Variant,
  layout: Layout = {}
): Required<Layout> => {
  switch (variant) {
    case 'small':
      return {
        showTitle: false,
        showSubtitle: false,
        showLegend: false,
        showAxisNames: false,
        showTicks: false,
        showTickLabels: false,
        ...layout,
      };

    case 'medium':
      return {
        showTitle: false,
        showSubtitle: false,
        showLegend: false,
        showAxisNames: false,
        showTicks: true,
        showTickLabels: true,
        ...layout,
      };

    case 'large':
      return {
        showTitle: true,
        showSubtitle: true,
        showLegend: true,
        showAxisNames: true,
        showTicks: true,
        showTickLabels: true,
        ...layout,
      };

    default:
      return {
        showTitle: true,
        showSubtitle: true,
        showLegend: true,
        showAxisNames: true,
        showTicks: true,
        showTickLabels: true,
        ...layout,
      };
  }
};
