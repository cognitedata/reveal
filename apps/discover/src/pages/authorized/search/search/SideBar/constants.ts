export const MS_TRANSITION_TIME = 300;

const FILTER_SIZE = {
  open: 352, // px
  closed: 62, // px
};
export const getFilterSizeStateInPX = (isOpen: boolean) => {
  const { open, closed } = FILTER_SIZE;
  return isOpen ? `${open}px` : `${closed}px`;
};

export const HIDE_BUTTON_TEXT_KEY = 'Hide';
export const EXPAND_FILTERS_TEXT = 'Click to expand filters';
export const DATE_RANGE_FILTER_FROM_PLACEHOLDER = 'From';
export const DATE_RANGE_FILTER_TO_PLACEHOLDER = 'To';
