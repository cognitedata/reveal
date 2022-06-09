import React, { useState } from 'react';
import { AssetFilterProps } from '@cognite/sdk';
import { action } from '@storybook/addon-actions';
import { PartialStoryFn } from '@storybook/addons';
import { Wrapper } from './utils';
import { DataSetFilter } from '../components/Search/Filters';
import { AssetSearchResults } from '../containers/SearchResults';

export const QueryBuilder = () => {
  const [assetFilter, setAssetFilter] = useState<AssetFilterProps>({});
  return (
    <div style={{ height: 400 }}>
      <code>{JSON.stringify(assetFilter, null, 2)}</code>
      <DataSetFilter
        resourceType="asset"
        value={assetFilter.dataSetIds}
        setValue={value =>
          setAssetFilter({ ...assetFilter, dataSetIds: value })
        }
      />
      <AssetSearchResults
        filter={assetFilter}
        isSelected={() => false}
        onSelect={action('onSelect')}
        onClick={action('onClick')}
        selectionMode="single"
      />
    </div>
  );
};
QueryBuilder.decorators = [
  (Story: PartialStoryFn<JSX.Element>) => (
    <Wrapper>
      <Story />
    </Wrapper>
  ),
];
