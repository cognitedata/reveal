import { useState } from 'react';

import withThemeProvider from 'storybook/utils/themeDecorator';

import { CheckBoxes } from '..';
import { ExtraLabels } from '../interfaces';

export const basic = () => {
  const [values] = useState<string[]>(['Option 1', 'Option 2', 'Option 3']);
  const [selected, setSelected] = useState<string[]>([]);
  const extraLabels: ExtraLabels = { 'Option 1': 'Extra Label' };

  return (
    <CheckBoxes<string>
      header={{ title: 'Checkbox Filter Example' }}
      options={values}
      selectedValues={selected}
      onValueChange={(vals: string[]) => setSelected(vals)}
      extraLabels={extraLabels}
    />
  );
};

export default {
  title: 'Components / Filters / Checkbox',
  component: CheckBoxes,
  decorators: [withThemeProvider],
};
