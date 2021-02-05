import React, { useState } from 'react';
import { assets } from 'stubs/assets';
import { MetadataFilter } from './MetadataFilter';

export default {
  title: 'Search Results/Filters/MetadataFilter',
  component: MetadataFilter,
};

export const Example = () => {
  const [value, setValue] = useState<any | undefined>(undefined);
  return <MetadataFilter items={assets} value={value} setValue={setValue} />;
};
