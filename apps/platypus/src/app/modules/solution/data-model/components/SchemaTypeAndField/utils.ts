import { BuiltInType } from '@platypus/platypus-core';

import { OptionType } from '@cognite/cogs.js';

export const groupOptions = (
  types: BuiltInType[],
  customTypes: string[],
  isListMode: boolean
) => {
  const mapToOption = (types: BuiltInType[], skipDivider = false) =>
    types.map((type, index, types) => ({
      value: type.name,
      label: isListMode ? `[${type.name}] list` : type.name,
      divider: skipDivider ? false : index === types.length - 1,
      isList: isListMode,
    }));

  const optionsList = [
    {
      label: '',
      options: mapToOption(
        types
          .filter((type) => type.type === 'SCALAR')
          .sort((a, b) => (a.name > b.name ? 1 : -1))
      ),
    },
    {
      label: 'Complex types',
      options: mapToOption(
        types
          .filter((type) => type.type === 'OBJECT')
          .sort((a, b) => (a.name > b.name ? 1 : -1))
      ),
    },
    {
      label: 'Data model types',
      options: mapToOption(
        customTypes
          .sort()
          .map((typeName) => ({ name: typeName, type: 'OBJECT' })),
        true
      ),
    },
  ] as OptionType<string>[];

  return optionsList;
};
