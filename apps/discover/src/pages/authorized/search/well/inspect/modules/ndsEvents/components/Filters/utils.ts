import { SELECTED_ALL_DISPLAY_VALUE } from './constants';

export const getMultiSelectDisplayValue = (
  options: string[],
  selectedOptions: string[]
) => {
  if (options.length === selectedOptions.length) {
    return SELECTED_ALL_DISPLAY_VALUE;
  }
  return `${selectedOptions.length}/${options.length}`;
};
