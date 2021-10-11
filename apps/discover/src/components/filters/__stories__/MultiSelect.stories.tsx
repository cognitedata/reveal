import { useState } from 'react';

import withThemeProvider from 'storybook/utils/themeDecorator';

import { MultiSelect } from '..';

export const basic = () => {
  const [values] = useState<string[]>(['a', 'b', 'c']);
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <MultiSelect
      options={values}
      selectedOptions={selected}
      onValueChange={(vals: string[]) => setSelected(vals)}
      title="Multi Select Filter Example"
    />
  );
};

export default {
  title: 'Components / Filters / MultiSelect',
  component: MultiSelect,
  decorators: [withThemeProvider],
};
