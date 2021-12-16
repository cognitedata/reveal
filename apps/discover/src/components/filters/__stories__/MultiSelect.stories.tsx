import { useState } from 'react';

import { MultiSelect } from '..';

export const Basic = () => {
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

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'Components / Filters / MultiSelect',
  component: MultiSelect,
};
