import { DEAULT_LAYOUT, LAYOUT_BY_VARIANT } from '../constants';
import { Layout, Variant } from '../types';

export const getLayout = (
  layout: Partial<Layout>,
  variant?: Variant
): Layout => {
  const layoutByVariant = variant ? LAYOUT_BY_VARIANT[variant] : DEAULT_LAYOUT;

  return {
    ...layoutByVariant,
    ...layout,
  };
};
