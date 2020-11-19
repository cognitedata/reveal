import React from 'react';
import { Col, Space } from 'antd';
import { Icon } from '@cognite/cogs.js';
import { InternalId } from '@cognite/sdk/dist/src';
import { ResourceType, getIcon, getTitle } from 'lib';
import { TitleRow } from '../ResourceTitleRow';
import { Actions } from './Actions';

type Props = {
  ids: InternalId[];
  resourceType: ResourceType;
};
export default function SelectedResourcesTitleRow({
  ids,
  resourceType,
}: Props) {
  return (
    <TitleRow>
      <Col flex="auto">
        <Space size="large" align="center">
          <Icon type={getIcon(resourceType)} />
          <h1>
            {ids.length}{' '}
            {getTitle(resourceType, ids.length !== 1).toLowerCase()} selected
          </h1>
        </Space>
      </Col>
      <Col flex="none">
        <Actions ids={ids} resourceType={resourceType} />
      </Col>
    </TitleRow>
  );
}
