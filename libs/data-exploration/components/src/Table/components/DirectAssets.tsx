import styled from 'styled-components';

import { EMPTY_ARRAY, RelationshipLabels } from '@data-exploration-lib/core';
import { useAssetsByIdQuery } from '@data-exploration-lib/domain-layer';

import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import { Asset, FileInfo, IdEither, Sequence, Timeseries } from '@cognite/sdk';

import { RootAssetButton } from '../../RootAsset';

interface DirectAssetsProps {
  data: Timeseries & RelationshipLabels & Asset & FileInfo & Sequence;
  onClick: (directAsset: Asset) => void;
  ids?: IdEither[];
}

export const DirectAssets = ({
  ids = EMPTY_ARRAY,
  data,
  onClick,
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
    const directAsset = items[0];
    return (
      <RootAssetButton
        label={directAsset.name}
        onClick={(evt) => {
          evt.stopPropagation();
          onClick(directAsset);
        }}
      />
    );
  }

  return (
    <Dropdown
      openOnHover
      content={
        <StyledMenu>
          {items?.map((item) => (
            <Menu.Item
              key={item.id}
              action={{
                icon: 'ArrowRight',
              }}
              onClick={(evt) => {
                evt.stopPropagation();
                onClick(item);
              }}
            >
              {item.name}
            </Menu.Item>
          ))}
        </StyledMenu>
      }
    >
      <Button
        icon="ChevronDown"
        iconPlacement="right"
        size="small"
        type="ghost"
      >
        {items?.length} Asset(s)
      </Button>
    </Dropdown>
  );
};

const StyledMenu = styled(Menu)`
  max-height: 300px;
  overflow: auto;
`;
