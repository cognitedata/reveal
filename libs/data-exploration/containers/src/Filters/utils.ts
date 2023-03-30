export const transformOptionsForMultiselectFilter = (
  options: string | string[]
) => {
  if (typeof options === 'string') {
    return [{ label: options, value: options }];
  }
  return options.map((value) => ({
    label: value,
    value,
  }));
};
