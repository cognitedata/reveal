import { useState } from 'react';

import { NumericRangeFilter } from '..';

export const Basic = () => {
  const [selected, setSelected] = useState<number[]>([0, 10]);

  return (
    <NumericRangeFilter
      min={0}
      max={10}
      selectedValues={selected}
      onValueChange={(selectedVals: number[]) => setSelected(selectedVals)}
      config={{ title: 'Numeric Range Filter Example' }}
    />
  );
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'Components / Filters / NumericRangeFilter',
  component: NumericRangeFilter,
};
