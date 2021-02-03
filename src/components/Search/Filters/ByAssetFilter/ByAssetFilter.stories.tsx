import React, { useState } from 'react';
import { text } from '@storybook/addon-knobs';
import { ByAssetFilter } from './ByAssetFilter';

export default {
  title: 'Search Results/Filters/ByAssetFilter',
  component: ByAssetFilter,
};
export const Example = () => {
  const [value, setValue] = useState<number[] | undefined>(undefined);
  return (
    <ByAssetFilter
      title={text('title', 'Asset')}
      value={value}
      setValue={setValue}
    />
  );
};
