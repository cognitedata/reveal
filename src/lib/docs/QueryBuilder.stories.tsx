import React, { useState } from 'react';
import { AssetFilterProps } from '@cognite/sdk';
import { Wrapper } from './utils';
import { DataSetFilter } from '../components/Search/Filters';
import { AssetSearchResults } from '../containers/Assets/AssetSearchResults/AssetSearchResults';

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
      <AssetSearchResults />
    </div>
  );
};
QueryBuilder.decorators = [
  Story => {
    return (
      <Wrapper>
        <Story />
      </Wrapper>
    );
  },
];
