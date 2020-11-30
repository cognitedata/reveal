import React from 'react';
import { Space } from 'antd';
import { Icon } from '@cognite/cogs.js';
import { InternalId } from '@cognite/sdk';
import { ResourceType, getIcon, getTitle } from 'lib';
import { TitleRowWrapper } from '../ResourceTitleRow';
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
    <TitleRowWrapper>
      <div
        style={{
          display: 'inline-block',
          overflow: 'hidden',
          width: 'calc(100% - 650px)',
        }}
      >
        <Space size="large" align="center">
          <Icon type={getIcon(resourceType)} />
          <h1>
            {ids.length}{' '}
            {getTitle(resourceType, ids.length !== 1).toLowerCase()} selected
          </h1>
        </Space>
      </div>
      <div
        style={{
          display: 'inline-block',
          overflow: 'hidden',
          width: 650,
        }}
      >
        <Actions ids={ids} resourceType={resourceType} />
      </div>
    </TitleRowWrapper>
  );
}
