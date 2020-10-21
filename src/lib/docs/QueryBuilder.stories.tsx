import React, { useContext } from 'react';
import { Wrapper } from './utils';
import { DataSetFilter } from '../containers/SearchResults/Filters';
import { AssetSearchResults } from '../containers/Assets/AssetSearchResults/AssetSearchResults';
import { ResourceSelectionContext } from '../context';

export const QueryBuilder = () => {
  const { assetFilter } = useContext(ResourceSelectionContext);
  return (
    <div style={{ height: 400 }}>
      <code>{JSON.stringify(assetFilter, null, 2)}</code>
      <DataSetFilter resourceType="asset" />
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
