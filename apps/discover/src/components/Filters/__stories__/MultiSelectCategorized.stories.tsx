import noop from 'lodash/noop';

import { MultiSelectCategorized } from '..';

export const Basic = () => {
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

  return (
    <MultiSelectCategorized
      title="Categorized Multiselect"
      options={options}
      enableSelectAll
      onValueChange={noop}
    />
  );
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'Components / Filters / MultiSelectCategorized',
  component: MultiSelectCategorized,
};
