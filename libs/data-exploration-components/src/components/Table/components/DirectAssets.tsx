import { createLink } from '@cognite/cdf-utilities';
import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import { Asset, FileInfo, IdEither, Sequence, Timeseries } from '@cognite/sdk';
import { CogniteEvent } from '@cognite/unified-file-viewer';
import { RelationshipLabels } from '../../../types';
import { StyledButton } from '../elements';
import React from 'react';
import {
  InternalAssetData,
  useAssetsByIdQuery,
} from '@data-exploration-lib/domain-layer';
import { EMPTY_ARRAY } from '@data-exploration-lib/core';

interface DirectAssetsProps {
  data: Timeseries &
    RelationshipLabels &
    Asset &
    CogniteEvent &
    FileInfo &
    Sequence;
  ids?: IdEither[];
}

export const DirectAssets = ({
  ids = EMPTY_ARRAY,
  data,
}: DirectAssetsProps) => {
  const { data: items, isLoading } = useAssetsByIdQuery(ids, {
    enabled:
      ids.length > 0 && (Boolean(data.assetIds) || Boolean(data.assetId)),
  });

  const hasData = items && items?.length > 0 && !isLoading;

  if (!hasData) {
    return null;
  }

  if (items.length === 1) {
    const rootAsset = items[0];
    return (
      <Button
        onClick={(e) => e.stopPropagation()}
        type="link"
        target="_blank"
        href={createLink(`/explore/asset/${rootAsset.id}`)}
        icon="ArrowUpRight"
        iconPlacement="right"
      >
        <StyledButton>{rootAsset.name}</StyledButton>
      </Button>
    );
  }

  return (
    <Dropdown
      openOnHover
      content={
        <Menu>
          {items?.map((item) => (
            <Menu.Item
              onClick={(e) => e.stopPropagation()}
              href={createLink(`/explore/asset/${item.id}`)}
              target="_blank"
              key={item.id}
            >
              {item.name}
            </Menu.Item>
          ))}
        </Menu>
      }
    >
      <Button icon="ChevronDown" iconPlacement="right">
        {items?.length} Asset(s)
      </Button>
    </Dropdown>
  );
};
