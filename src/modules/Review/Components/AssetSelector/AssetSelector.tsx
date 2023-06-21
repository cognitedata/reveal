import { AssetSelect } from '@cognite/data-exploration';
import styled from 'styled-components';
import { Body } from '@cognite/cogs.js';
import React from 'react';

export const AssetSelector = (props: {
  assets: number[] | undefined;
  onSelectAssets: (assets: number[] | undefined) => void;
  hideTitle?: boolean;
  maxMenuHeight?: number;
}) => {
  return (
    <AssetSelectContainer>
      {!props.hideTitle && (
        <AssetSelectTitle level={2}>Search for asset</AssetSelectTitle>
      )}
      <AssetSelectWrapper>
        <AssetSelect
          isMulti
          selectedAssetIds={props.assets}
          onAssetSelected={(assetIds: number[] | undefined) => {
            props.onSelectAssets(assetIds);
          }}
          maxMenuHeight={props.maxMenuHeight}
        />
      </AssetSelectWrapper>
    </AssetSelectContainer>
  );
};

const AssetSelectContainer = styled.div`
  margin-bottom: 18px;
`;

const AssetSelectTitle = styled(Body)``;
const AssetSelectWrapper = styled.div`
  padding: 5px 3px;
`;
