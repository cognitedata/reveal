import noop from 'lodash/noop';

import { MultiSelectCategorized } from '..';

const options = [
  {
    category: 'Category 1',
    options: ['Option 1.1', 'Option 1.2'],
  },
  {
    category: 'Category 2',
    options: ['Option 2.1', 'Option 2.2', 'Option 2.3'],
  },
];

export const Basic = () => {
  return (
    <MultiSelectCategorized
      title="Categorized Multiselect"
      options={options}
      enableSelectAll
      onValueChange={noop}
      width={500}
    />
  );
};

export const PreSelected = () => {
  return (
    <MultiSelectCategorized
      title="Categorized Multiselect"
      options={options}
      enableSelectAll
      selectedOptions={{
        'Category 1': [
          {
            value: 'Option 1.1',
          },
        ],
        'Category 2': ['Option 2.2'],
      }}
      onValueChange={noop}
      width={500}
    />
  );
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'Components / Filters / MultiSelectCategorized',
  component: MultiSelectCategorized,
};
