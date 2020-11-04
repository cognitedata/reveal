import React, { useCallback, useContext } from 'react';
import { Title } from '@cognite/cogs.js';
import { InternalId, Asset } from '@cognite/sdk';
import { ResourceSelectionContext, useResourceFilter } from 'lib/context';
import { AssetSelect } from 'lib/containers/Assets';
import { ResourceType } from 'lib/types';

export const ByAssetFilter = ({
  resourceType,
}: {
  resourceType: ResourceType;
}) => {
  const filter = useResourceFilter(resourceType);
  const {
    setSequenceFilter,
    setTimeseriesFilter,
    setFileFilter,
    setEventFilter,
  } = useContext(ResourceSelectionContext);
  const currentAssetIds = filter?.assetSubtreeIds?.map(
    el => (el as InternalId).id
  );

  const setFilterByAsset = useCallback(
    (assets: Asset[] | undefined) => {
      switch (resourceType) {
        case 'sequence':
          setSequenceFilter(newFilter => ({
            ...newFilter,
            assetSubtreeIds: assets
              ? assets.map(el => ({ id: el.id }))
              : undefined,
          }));
          break;
        case 'event':
          setEventFilter(newFilter => ({
            ...newFilter,
            assetSubtreeIds: assets
              ? assets.map(el => ({ id: el.id }))
              : undefined,
          }));
          break;
        case 'timeSeries':
          setTimeseriesFilter(newFilter => ({
            ...newFilter,
            assetSubtreeIds: assets
              ? assets.map(el => ({ id: el.id }))
              : undefined,
          }));
          break;
        case 'file':
          setFileFilter(newFilter => ({
            ...newFilter,
            assetSubtreeIds: assets
              ? assets.map(el => ({ id: el.id }))
              : undefined,
          }));
          break;
      }
    },
    [
      resourceType,
      setTimeseriesFilter,
      setFileFilter,
      setEventFilter,
      setSequenceFilter,
    ]
  );

  return (
    <>
      <Title level={4} style={{ marginBottom: 12 }} className="title">
        Asset
      </Title>
      <AssetSelect
        isMulti
        selectedAssetIds={currentAssetIds}
        onAssetSelected={setFilterByAsset}
      />
    </>
  );
};
