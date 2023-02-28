import { DEAULT_LAYOUT, LAYOUT_BY_VARIANT } from '../constants';
import { Layout, Variant } from '../types';

export const getLayout = (
  variant?: Variant,
  layout: Layout = {}
): Required<Layout> => {
  const layoutByVariant = variant ? LAYOUT_BY_VARIANT[variant] : DEAULT_LAYOUT;

  return {
    ...layoutByVariant,
    ...layout,
  };
};
