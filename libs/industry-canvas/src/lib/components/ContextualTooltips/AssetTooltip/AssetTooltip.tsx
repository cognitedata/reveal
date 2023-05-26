import React from 'react';

import styled from 'styled-components';

import { Icon, Colors, Body, Button, Tooltip } from '@cognite/cogs.js';

import { useAsset } from '../../../hooks/useAsset';
import * as ContextualTooltip from '../ContextualTooltip';

import ThreeDButton from './ThreeDButton';
import TimeseriesList from './TimeseriesList';

type AssetTooltipProps = {
  id: number;
  onAddThreeD: ({
    modelId,
    revisionId,
    initialAssetId,
  }: {
    modelId: number;
    revisionId: number;
    initialAssetId?: number;
  }) => void;
  onAddTimeseries: (timeseriesId: number) => void;
  onAddAsset: () => void;
  onViewAsset: () => void;
};

const AssetTooltip: React.FC<AssetTooltipProps> = ({
  id,
  onAddAsset,
  onViewAsset,
  onAddThreeD,
  onAddTimeseries,
}) => {
  const { data: asset, isLoading } = useAsset(id);

  if (isLoading) {
    return <Icon type="Loader" />;
  }

  if (asset === undefined) {
    // This should probably never happen
    return null;
  }

  return (
    <ContextualTooltip.Container>
      <ContextualTooltip.Header>
        <ContextualTooltip.InnerHeaderWrapper>
          <ContextualTooltip.StyledIcon
            type="Assets"
            color={Colors['text-icon--status-neutral--inverted']}
          />
          <ContextualTooltip.Label>
            {asset.name ?? asset.externalId}
          </ContextualTooltip.Label>
        </ContextualTooltip.InnerHeaderWrapper>

        <ContextualTooltip.ButtonsContainer>
          <ContextualTooltip.ButtonWrapper>
            <Tooltip content="Add asset to canvas">
              <Button icon="Add" onClick={onAddAsset} inverted />
            </Tooltip>
          </ContextualTooltip.ButtonWrapper>

          <ContextualTooltip.ButtonWrapper>
            <ThreeDButton
              assetId={asset.id}
              onAddThreeD={onAddThreeD}
              aria-label="Add 3D Model to Canvas"
            />
          </ContextualTooltip.ButtonWrapper>

          <ContextualTooltip.ButtonWrapper>
            <Tooltip content="Open asset in Data Explorer">
              <Button icon="ExternalLink" onClick={onViewAsset} inverted />
            </Tooltip>
          </ContextualTooltip.ButtonWrapper>
        </ContextualTooltip.ButtonsContainer>
      </ContextualTooltip.Header>

      <AssetType level={3}>Asset</AssetType>

      {asset.description !== undefined && (
        <ContextualTooltip.Description level={3}>
          {asset.description}
        </ContextualTooltip.Description>
      )}
      <TimeseriesList assetId={id} onAddTimeseries={onAddTimeseries} />
    </ContextualTooltip.Container>
  );
};

const AssetType = styled(Body)`
  padding: 4px 0;
  text-transform: uppercase;
  color: ${Colors['text-icon--strong--inverted']};
`;

export default AssetTooltip;
