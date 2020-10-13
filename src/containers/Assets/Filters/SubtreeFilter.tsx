import React, { useContext } from 'react';
import { ResourceSelectionContext } from 'context';
import { AssetSelect } from 'components/Common';
import { Title } from '@cognite/cogs.js';
import { InternalId } from '@cognite/sdk';

export const SubtreeFilter = () => {
  const { assetFilter, setAssetFilter } = useContext(ResourceSelectionContext);

  return (
    <>
      <Title level={4} style={{ marginBottom: 12 }} className="title">
        Parent
      </Title>
      <AssetSelect
        isMulti
        selectedAssetIds={
          assetFilter.assetSubtreeIds
            ? assetFilter.assetSubtreeIds.map(el => (el as InternalId).id!)
            : undefined
        }
        onAssetSelected={item => {
          if (!item) {
            setAssetFilter(filter => ({
              ...filter,
              assetSubtreeIds: undefined,
            }));
          } else {
            setAssetFilter(filter => ({
              ...filter,
              assetSubtreeIds: item.map(el => ({
                id: el.id,
              })),
            }));
          }
        }}
      />
    </>
  );
};
