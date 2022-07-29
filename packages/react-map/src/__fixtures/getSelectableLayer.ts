import { SelectableLayer } from '../layers/types';

export const getSelectableLayer = (layer?: Partial<SelectableLayer>) => {
  return {
    id: 1,
    name: 'test layer',
    selected: false,
    layers: [],
    color: 'red',
    disabled: false,
    defaultOn: false,
    alwaysOn: true,
    ...layer,
  };
};
