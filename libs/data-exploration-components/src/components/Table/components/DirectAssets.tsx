import { createLink } from '@cognite/cdf-utilities';
import { Button, Dropdown, Link, Menu } from '@cognite/cogs.js';
import { Asset, FileInfo, IdEither, Sequence, Timeseries } from '@cognite/sdk';
import { CogniteEvent } from '@cognite/unified-file-viewer';
import { RelationshipLabels } from '../../../types';
import { useAssetsByIdQuery } from '@data-exploration-lib/domain-layer';
import { EMPTY_ARRAY } from '@data-exploration-lib/core';
import styled from 'styled-components';
import { RootAssetButton } from '@data-exploration-components/components/RootAsset';

interface DirectAssetsProps {
  data: Timeseries &
    RelationshipLabels &
    Asset &
    CogniteEvent &
    FileInfo &
    Sequence;
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
            <Menu.Item css={{}} key={item.id}>
              <RootAssetButton
                label={item.name}
                onClick={(evt) => {
                  evt.stopPropagation();
                  onClick(item);
                }}
              />
            </Menu.Item>
          ))}
        </StyledMenu>
      }
    >
      <Button icon="ChevronDown" iconPlacement="right">
        {items?.length} Asset(s)
      </Button>
    </Dropdown>
  );
};

const StyledMenu = styled(Menu)`
  max-height: 300px;
  overflow: auto;
`;
