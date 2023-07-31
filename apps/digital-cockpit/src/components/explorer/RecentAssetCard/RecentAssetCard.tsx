import { Body, Flex, Icon, Micro, Tag } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';
import useAssetChildrenAggregates from 'hooks/useQuery/useAssetChildrenAggregates';

import { Card, TagContainer } from './elements';

export type RecentAssetCardProps = {
  asset: Asset;
  onClick?: () => void;
};

const RecentAssetCard = ({ asset, onClick }: RecentAssetCardProps) => {
  const { data: count } = useAssetChildrenAggregates(asset.id);

  return (
    <Card onClick={onClick}>
      <Flex alignItems="center">
        <Icon type="Assets" className="recent-asset-card--icon" />
        <Body level={2} strong>
          {asset.name}
        </Body>
      </Flex>
      <Micro className="recent-asset-card--description">
        {asset.description}
      </Micro>
      <TagContainer>
        <Tag icon="Assets">{count.assets}</Tag>
        <Tag icon="Timeseries">{count.timeseries}</Tag>
        <Tag icon="Document">{count.files}</Tag>
        <Tag icon="Events">{count.events}</Tag>
      </TagContainer>
    </Card>
  );
};

export default RecentAssetCard;
