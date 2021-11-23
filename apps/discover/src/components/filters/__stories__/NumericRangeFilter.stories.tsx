import { useState } from 'react';

import { NumericRangeFilter } from '..';

export const basic = () => {
  const [selected, setSelected] = useState<number[]>([0, 10]);

  return (
    <NumericRangeFilter
      values={[0, 10]}
      selectedValues={selected}
      onValueChange={(selectedVals: number[]) => setSelected(selectedVals)}
      config={{ title: 'Numeric Range Filter Example' }}
    />
  );
};

export default {
  title: 'Components / Filters / NumericRangeFilter',
  component: NumericRangeFilter,
};
