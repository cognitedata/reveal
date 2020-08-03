import React, { useState, useEffect } from 'react';
import { Body, Colors } from '@cognite/cogs.js';
import { SearchFilterSection, ListItem } from 'components/Common';
import { Asset, AssetSearchFilter, AssetFilterProps } from '@cognite/sdk';
import { useSelector, useDispatch } from 'react-redux';
import { searchSelector, search, count, countSelector } from 'modules/assets';
import Highlighter from 'react-highlight-words';
import { AssetMetadataPreview } from 'containers/ResourceSidebar';
import { RenderResourceActionsFunction } from 'containers/HoverPreview';
import { List, Content, Preview } from './Common';

const AssetsFilterMapping: { [key: string]: string } = {};

const buildAssetsFilterQuery = (
  filter: {
    [key: string]: string;
  },
  query: string | undefined
): AssetSearchFilter => {
  const reverseLookup: { [key: string]: string } = Object.keys(
    AssetsFilterMapping
  ).reduce((prev, key) => ({ ...prev, [AssetsFilterMapping[key]]: key }), {});
  return {
    ...(query &&
      query.length > 0 && {
        search: {
          query,
        },
      }),
    filter: Object.keys(filter).reduce(
      (prev, key) => ({
        ...prev,
        [reverseLookup[key] || key]: filter[key],
      }),
      {}
    ) as AssetFilterProps,
  };
};

export const AssetFilterSearch = ({
  query = '',
  renderResourceActions = () => [],
  activeIds = [],
}: {
  query?: string;
  renderResourceActions?: RenderResourceActionsFunction;
  activeIds?: number[];
}) => {
  const dispatch = useDispatch();
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>(
    undefined
  );
  const [assetsFilter, setAssetsFilter] = useState<{
    [key: string]: string;
  }>({});

  const { items: assets } = useSelector(searchSelector)(
    buildAssetsFilterQuery(assetsFilter, query)
  );
  const { count: fileCount } = useSelector(countSelector)(
    buildAssetsFilterQuery(assetsFilter, query)
  );

  useEffect(() => {
    dispatch(search(buildAssetsFilterQuery(assetsFilter, query)));
    dispatch(count(buildAssetsFilterQuery(assetsFilter, query)));
  }, [dispatch, assetsFilter, query]);

  return (
    <>
      <SearchFilterSection
        metadata={{}}
        filters={assetsFilter}
        setFilters={setAssetsFilter}
      />
      <Content>
        <List>
          <Body>
            {query && query.length > 0
              ? `${fileCount || 'Loading'} results for "${query}"`
              : `All ${fileCount || ''} Results`}
          </Body>
          {assets.map(el => {
            return (
              <ListItem
                key={el.id}
                style={{
                  background: [
                    selectedAsset ? selectedAsset.id : undefined,
                    ...activeIds,
                  ].some(id => id === el.id)
                    ? Colors['greyscale-grey3'].hex()
                    : 'inherit',
                }}
                title={
                  <Highlighter
                    searchWords={(query || '').split(' ')}
                    textToHighlight={el.name}
                  />
                }
                onClick={() => setSelectedAsset(el)}
              />
            );
          })}
        </List>
        <Preview>
          {selectedAsset && (
            <AssetMetadataPreview
              showBack={false}
              assetId={selectedAsset.id}
              extraActions={renderResourceActions({
                assetId: selectedAsset.id,
              })}
            />
          )}
        </Preview>
      </Content>
    </>
  );
};
