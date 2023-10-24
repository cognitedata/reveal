import styled from 'styled-components';

import { Body } from '@cognite/cogs.js';
import { AssetSelect, OptionValue } from '@cognite/data-exploration';

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
          title="Asset select"
          selectedAssetIds={props.assets}
          onAssetSelected={(assetIds: OptionValue<number>[] | undefined) => {
            props.onSelectAssets(assetIds?.map((ids) => ids.value));
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
