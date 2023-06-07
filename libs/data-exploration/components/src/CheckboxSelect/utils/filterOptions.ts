import { OptionType } from '../types';

export const filterOptions = <T extends Pick<OptionType, 'label' | 'value'>>(
  options: T[],
  searchValue: string
) => {
  return options.filter(({ label, value }) => {
    const name = label || value;
    return new RegExp(searchValue.toLowerCase()).test(name.toLowerCase());
  });
};
