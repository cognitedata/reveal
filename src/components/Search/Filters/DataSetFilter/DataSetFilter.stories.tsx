import React, { useState } from 'react';
import { select } from '@storybook/addon-knobs';
import { ResourceType } from 'types';
import { IdEither } from '@cognite/sdk';
import { DataSetFilter } from './DataSetFilter';

export default {
  title: 'Search Results/Filters/DataSetFilter',
  component: DataSetFilter,
};
export const Example = () => {
  const [value, setValue] = useState<IdEither[] | undefined>(undefined);
  return (
    <DataSetFilter
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
