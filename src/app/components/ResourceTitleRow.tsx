import React from 'react';
import { Row, Col, Space } from 'antd';
import { Icon, AllIconTypes } from '@cognite/cogs.js';
import { ResourceType, convertResourceType } from 'lib';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import styled from 'styled-components';
import { lightGrey } from 'lib/utils/Colors';
import TitleRowActions from './TitleRowActions';

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

  return (
    <TitleRow align="middle" justify="space-between">
      <Col flex="auto">
        <Space size="large" align="center">
          <Icon type={isFetched ? icon : 'Loading'} />
          <h1>{getTitle(data) || id}</h1>
        </Space>
      </Col>
      <Col flex="none">
        <TitleRowActions type={type} id={id} />
      </Col>
    </TitleRow>
  );
}

const TitleRow = styled(Row)`
  h1 {
    margin: 0;
  }
  margin: 16px 0;
  border-bottom: 1px solid ${lightGrey};
  padding-bottom: 16px;
`;
