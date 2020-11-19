import React from 'react';
import { Row, Col, Space } from 'antd';
import { Icon } from '@cognite/cogs.js';
import { convertResourceType, getIcon } from 'lib';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import styled from 'styled-components';
import { lightGrey } from 'lib/utils/Colors';
import { TitleRowActions } from './TitleRowActions';
import { TitleRowActionsProps } from './TitleRowActions/TitleRowActions';

type Props = {
  getTitle?: (_: any) => string | undefined;
} & TitleRowActionsProps;

export default function ResourceTileRow({
  item: { type, id },
  getTitle = (i: any) => i?.name,
  actions,
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
          <Icon type={isFetched ? getIcon(type) : 'Loading'} />
          <h1>{getTitle(data) || id}</h1>
        </Space>
      </Col>
      <Col flex="none">
        <TitleRowActions item={{ type, id }} actions={actions} />
      </Col>
    </TitleRow>
  );
}

export const TitleRow = styled(Row)`
  h1 {
    margin: 0;
  }
  margin: 16px 0px;
  padding-left: 16px;
  border-bottom: 1px solid ${lightGrey};
  padding-bottom: 16px;
`;
