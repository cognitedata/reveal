import React from 'react';

import { AllIconTypes, Icon } from '@cognite/cogs.js';
import { ResourceType, getIcon, getTitle } from '@cognite/data-exploration';
import { InternalId } from '@cognite/sdk';
import { Space } from 'antd';
import styled from 'styled-components';

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
      <SelectedResourcesTitleWrapper>
        <Space size="large" align="center">
          <Icon type={getIcon(resourceType) as AllIconTypes} />
          <h1>
            {ids.length}{' '}
            {getTitle(resourceType, ids.length !== 1).toLowerCase()} selected
          </h1>
        </Space>
      </SelectedResourcesTitleWrapper>
      <SelectedResourcesActionsWrapper>
        <Actions ids={ids} resourceType={resourceType} />
      </SelectedResourcesActionsWrapper>
    </TitleRowWrapper>
  );
}

const SelectedResourcesTitleWrapper = styled.div`
  margin-right: 16px;
  white-space: nowrap;
`;

const SelectedResourcesActionsWrapper = styled.div`
  margin-left: auto;
`;
