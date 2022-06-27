import { Icon } from '@cognite/cogs.js';
import { Skeleton } from 'antd';
import { AssetItem } from './elements/AssetItem';
import { TSList } from './elements/TSList';
import { Row } from './elements/Row';
import { InfoContainer } from './elements/InfoContainer';
import { ResourceNameWrapper } from './elements/ResourceNameWrapper';
import { Description } from './elements/Description';
import { Right } from './elements/Right';
import LoadingTimeSeriesResultItem from './LoadingTimeSeriesResultItem';

export default function LoadingLinkedAsset() {
  return (
    <AssetItem>
      <Row>
        <InfoContainer>
          <ResourceNameWrapper>
            <Icon type="Assets" size={14} style={{ marginRight: 5 }} />
            <Skeleton.Button active block />
          </ResourceNameWrapper>
          <Description />
        </InfoContainer>
        <Right />
      </Row>
      <Row>
        <TSList>
          {Array(3)
            .fill(1)
            .map((a) => (
              <LoadingTimeSeriesResultItem key={a + 1} />
            ))}
        </TSList>
      </Row>
    </AssetItem>
  );
}
