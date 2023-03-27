import { useDetailedMappingsByAssetIdQuery } from '@data-exploration-lib/domain-layer';
import { noop } from 'lodash';
import React from 'react';
import {
  Icon,
  Title,
  Colors,
  Body,
  Elevations,
  Button,
} from '@cognite/cogs.js';
import { useAsset } from '../../hooks/useAsset';
import styled from 'styled-components';
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

type ThreeDButtonProps = {
  assetId: number;
  onAddThreeD: ({
    modelId,
    revisionId,
    initialAssetId,
  }: {
    modelId: number;
    revisionId: number;
    initialAssetId: number;
  }) => void;
};

const ThreeDButton: React.FC<ThreeDButtonProps> = ({
  assetId,
  onAddThreeD,
}) => {
  const { data: mappings, isLoading } =
    useDetailedMappingsByAssetIdQuery(assetId);

  if (isLoading) {
    return <Button icon="Loader" inverted onClick={noop} />;
  }

  if (mappings === undefined || mappings.length === 0) {
    return null;
  }

  const onClick = async () => {
    const mapping = mappings[0];
    onAddThreeD({
      modelId: mapping.modelId,
      revisionId: mapping.revisionId,
      initialAssetId: assetId,
    });
  };

  return <Button icon="Cube" onClick={onClick} inverted />;
};

const AssetTooltip: React.FC<AssetTooltipProps> = ({
  id,
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
    <Container>
      <Header>
        <InnerHeaderWrapper>
          <StyledAssetIcon type="Assets" />
          <Label level={5}>{asset.name ?? asset.externalId}</Label>
        </InnerHeaderWrapper>

        <ThreeDButton
          assetId={asset.id}
          onAddThreeD={onAddThreeD}
          aria-label="Add 3D Model to Canvas"
        />
      </Header>

      <AssetType level={3}>Asset</AssetType>

      {asset.description !== undefined && (
        <Description level={3}>{asset.description}</Description>
      )}
      <TimeseriesList assetId={id} onAddTimeseries={onAddTimeseries} />
    </Container>
  );
};

const Container = styled.div`
  width: 296px;
  background: ${Colors['surface--muted--inverted']};
  border: 1px solid ${Colors['border--muted--inverted']};
  box-shadow: ${Elevations['elevation--overlay']};
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-bottom: 4px;
  justify-content: space-between;
`;

const InnerHeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const StyledAssetIcon = styled(Icon)`
  color: #bcd0fa;
  margin-right: 8px;
`;

const Label = styled(Title)`
  color: ${Colors['text-icon--strong--inverted']};
  justify-content: center;
  align-items: center;
`;

const Description = styled(Body)`
  color: ${Colors['text-icon--muted--inverted']};
  padding: 4px 0;
`;

const AssetType = styled(Body)`
  padding: 4px 0;
  text-transform: uppercase;
  color: ${Colors['text-icon--strong--inverted']};
`;

export default AssetTooltip;
