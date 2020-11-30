import React from 'react';
import { Row, Col, Space } from 'antd';
import { Link } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';
import { Icon } from '@cognite/cogs.js';
import { convertResourceType, ResourceIcons } from 'lib';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import styled from 'styled-components';
import { lightGrey } from 'lib/utils/Colors';
import { trackUsage } from 'app/utils/Metrics';
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

  // The resource name should only be a link from resource preview
  const inSearch = window.location.pathname.includes('/search');

  return (
    <TitleRow align="middle" justify="space-between">
      <Col flex="auto" style={{ alignItems: 'center' }}>
        <CustomSpace size="large" align="center">
          {!inSearch &&
            (isFetched ? (
              <ResourceIcons type={type} />
            ) : (
              <Icon type="Loading" />
            ))}
          {inSearch ? (
            <Link
              to={createLink(`/explore/${type}/${id}`)}
              onClick={() => trackUsage('Exploration.FullPage', { type, id })}
            >
              <ClickableName>
                <NameHeader>{getTitle(data) || id}</NameHeader>
                <LinkIcon type="ArrowForward" />
              </ClickableName>
            </Link>
          ) : (
            <h1>{getTitle(data) || id}</h1>
          )}
        </CustomSpace>
      </Col>
      <Col flex="none">
        <TitleRowActions item={{ type, id }} actions={actions} />
      </Col>
    </TitleRow>
  );
}

const CustomSpace = styled(Space)`
  .ant-space-item {
    display: flex;
    align-items: center;
  }
`;

export const TitleRow = styled(Row)`
  h1 {
    margin: 0;
  }
  margin: 16px 0px;
  padding-left: 16px;
  border-bottom: 1px solid ${lightGrey};
  padding-bottom: 16px;
`;

const ClickableName = styled.div`
  display: flex;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  &:hover {
    text-decoration: underline;
  }
`;

const NameHeader = styled.h1`
  color: var(--cogs-primary);
`;

const LinkIcon = styled(Icon)`
  margin-left: 8px;
  color: var(--cogs-primary);
`;
