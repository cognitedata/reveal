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
  onAddTimeseries: (timeseriesId: number) => void;
  onAddAsset: () => void;
  onViewAsset: () => void;
};

const AssetTooltip: React.FC<AssetTooltipProps> = ({ id, onAddTimeseries }) => {
  const { data: asset, isLoading: isLoading } = useAsset(id);

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

        <Button type="ghost" inverted icon="EllipsisHorizontal" size="medium" />
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
