import React, { useState } from 'react';
import { select } from '@storybook/addon-knobs';
import { ResourceType } from 'lib/types';
import { LabelFilter } from './LabelFilter';

export default {
  title: 'Search Results/Filters/LabelFilter',
  component: LabelFilter,
};

export const Example = () => {
  const [value, setValue] = useState<{ externalId: string }[] | undefined>(
    undefined
  );
  return (
    <LabelFilter
      value={value}
      setValue={setValue}
      resourceType={select<ResourceType>(
        'api',
        ['asset', 'timeSeries', 'sequence', 'file', 'event'],
        'asset'
      )}
    />
  );
};
