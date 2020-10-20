import React, { useContext } from 'react';
import { assets } from 'stubs/assets';
import { sdk, Wrapper } from './utils';
import { DataSetFilter } from '../lib/containers/SearchResults/Filters';
import { AssetSearchResults } from '../lib/containers/Assets/AssetSearchResults/AssetSearchResults';
import { ResourceSelectionContext } from '../lib/context';

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
    // @ts-ignore
    sdk.post = async (query: string, body) => {
      if (query.includes('datasets')) {
        return { data: { items: [{ name: 'david', id: 123 }] } };
      }
      if (query.includes('assets')) {
        if (query.includes('aggregate')) {
          return { data: { items: [{ count: 1 }] } };
        }
        if (body.data && body.data.filter && body.data.filter.dataSetIds) {
          return { data: { items: [assets[2]] } };
        }
        return { data: { items: assets } };
      }

      return { data: { items: [] } };
    };
    // @ts-ignore
    sdk.groups.list = async () => [
      {
        capabilities: [{ datasetsAcl: { actions: ['READ', 'WRITE'] } }],
      },
    ];
    return (
      <Wrapper>
        <Story />
      </Wrapper>
    );
  },
];
