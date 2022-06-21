export const getMultiSelectDisplayValue = (
  options: string[],
  selectedOptions: string[]
) => {
  return `${selectedOptions.length}/${options.length}`;
};
