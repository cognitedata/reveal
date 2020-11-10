import React from 'react';
import { Row, Col, Space } from 'antd';
import { Icon, AllIconTypes, Button } from '@cognite/cogs.js';
import { ResourceType, convertResourceType } from 'lib';
import CollectionsDropdown from 'app/components/CollectionsDropdown';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { useCollectionFeature } from 'app/utils/featureFlags';

type Props = {
  icon: AllIconTypes;
  type: ResourceType;
  id: number;
  getTitle?: (_: any) => string | undefined;
};
export default function ResourceTileRow({
  icon,
  type,
  id,
  getTitle = (i: any) => i?.name,
}: Props) {
  const { data, isFetched } = useCdfItem<{ name?: string }>(
    convertResourceType(type),
    {
      id,
    }
  );

  const showCollections = useCollectionFeature();
  return (
    <Row align="middle" justify="space-between">
      <Col>
        <Space size="large" align="center">
          <Icon type={isFetched ? icon : 'Loading'} />
          <h1>{getTitle(data) || id}</h1>
        </Space>
      </Col>
      {showCollections && (
        <Col>
          <CollectionsDropdown
            type={type}
            items={[{ id }]}
            button={
              <Button icon="ChevronDownCompact" iconPlacement="right">
                Add to collection
              </Button>
            }
          />
        </Col>
      )}
    </Row>
  );
}
