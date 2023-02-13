import { createLink } from '@cognite/cdf-utilities';
import { Button, Dropdown, Link, Menu } from '@cognite/cogs.js';
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
import styled from 'styled-components';
import { RootAssetButton } from '@data-exploration-components/components/RootAsset';

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
      <RootAssetButton
        label={rootAsset.name}
        onClick={() => createLink(`/explore/asset/${rootAsset.id}`)}
        externalLink
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
              <StyledLink
                href={createLink(`/explore/asset/${item.id}`)}
                target="_blank"
              >
                {item.name}
              </StyledLink>
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

const StyledLink = styled(Link)`
  width: 100%;
  display: block;
  text-align: left;
  justify-content: unset;
`;

const StyledMenu = styled(Menu)`
  max-height: 300px;
  overflow: auto;
`;
