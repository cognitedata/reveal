import { DateRange } from '@cognite/cdf-sdk-singleton';
import { ComponentStory } from '@storybook/react';
import { useState } from 'react';

import { DateFilter } from './DateFilter';

export default {
  title: 'Filters/DateFilter',
  component: DateFilter,
};

export const Example: ComponentStory<typeof DateFilter> = () => {
  const [value, setValue] = useState<DateRange>({});
  return (
    <DateFilter
      value={value}
      onChange={(newValue) => setValue((prev) => ({ ...prev, ...newValue }))}
    />
  );
};
