import { Asset, CogniteInternalId } from '@cognite/sdk';
import React, { useContext, useMemo, useState } from 'react';
import { CogniteSDKContext } from 'providers/CogniteSDKProvider';
import debounce from 'lodash/debounce';
import { UseQueryResult, useQuery } from 'react-query';
import { Input, Tooltip } from '@cognite/cogs.js';
import Loading from 'components/utils/Loading';
import { useAssetSearchQuery } from 'hooks/useQuery/useAssetQuery';

import { AssetSearchWrapper, AssetSearchItem } from './elements';

export type AssetSearchProps = {
  onSelect: (selectedAsset: Asset) => void;
  cleanStateComponent?: React.ReactElement;
  limit?: number;
};

const AssetSearch: React.FC<AssetSearchProps> = ({
  onSelect,
  cleanStateComponent,
  limit = 20,
}) => {
  const { client } = useContext(CogniteSDKContext);
  // The actual value of the input field
  const [value, setValue] = useState('');
  // The field we pass to the query (so we can debounce)
  const [query, setQuery] = useState('');
  const debouncedSetQuery = useMemo(() => debounce(setQuery, 300), []);
  const [selectedAssetId, setSelectedAssetId] = useState<
    CogniteInternalId | undefined
  >();

  const assetSearchQuery = useAssetSearchQuery({
    search: {
      name: query,
    },
    limit,
  });

  const onAssetSelect = (asset: Asset) => {
    setSelectedAssetId(asset.id);
    onSelect(asset);
  };

  const renderSearchResults = (assets: Asset[]) => {
    return (
      <>
        {assets.map((asset) => (
          <AssetSearchItem
            key={asset.id}
            onClick={() => onAssetSelect(asset)}
            className={selectedAssetId === asset.id ? 'selected' : ''}
          >
            <Tooltip content={asset.name}>
              <p className="asset-title">{asset.name}</p>
            </Tooltip>
            {asset.description && (
              <Tooltip content={asset.description}>
                <p className="asset-description">{asset.description}</p>
              </Tooltip>
            )}
          </AssetSearchItem>
        ))}
      </>
    );
  };

  const renderAssetsPanel = () => {
    const { data, isLoading }: UseQueryResult<Asset[], unknown> =
      assetSearchQuery;

    if (isLoading) {
      return <Loading />;
    }
    if (!query && cleanStateComponent) {
      return cleanStateComponent;
    }
    if (data) {
      return renderSearchResults(data);
    }

    return null;
  };

  return (
    <AssetSearchWrapper>
      <Input
        className="search-input"
        placeholder="Search"
        icon="Search"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          debouncedSetQuery(e.target.value);
        }}
      />
      {renderAssetsPanel()}
    </AssetSearchWrapper>
  );
};

export default React.memo(AssetSearch);
