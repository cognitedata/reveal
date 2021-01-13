import React from 'react';

import { Link, useLocation, useHistory } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';
import { Icon, Button, Tooltip } from '@cognite/cogs.js';
import {
  getTitle as getResourceTypeTitle,
  convertResourceType,
  ResourceItem,
  ResourceIcons,
} from 'lib';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import styled from 'styled-components';
import { lightGrey } from 'lib/utils/Colors';
import { trackUsage } from 'app/utils/Metrics';
import { useQueryString } from 'app/hooks';
import { SEARCH_KEY } from 'app/utils/contants';
import { Divider, Space } from 'antd';
import { TitleRowActions } from './TitleRowActions';

type Props = {
  item: ResourceItem;
  getTitle?: (_: any) => string | undefined;
  beforeDefaultActions?: React.ReactNode;
  afterDefaultActions?: React.ReactNode;
  actionWidth?: number;
  backWidth?: number;
};

export default function ResourceTitleRow({
  item: { type, id },
  getTitle = (i: any) => i?.name,
  beforeDefaultActions,
  afterDefaultActions,
  actionWidth = 275,
  backWidth = 70,
}: Props) {
  const { data, isFetched } = useCdfItem<{ name?: string }>(
    convertResourceType(type),
    {
      id,
    }
  );

  const history = useHistory();
  const location = useLocation();
  const inSearch = location.pathname.includes('/search');
  const [query] = useQueryString(SEARCH_KEY);

  const nameWidth = `calc(100% - ${
    inSearch ? actionWidth : actionWidth + backWidth
  }px)`;
  const name = (
    <NameWrapper>
      {!inSearch &&
        (isFetched ? (
          <ResourceIcons type={type} style={{ marginRight: '10px' }} />
        ) : (
          <Icon type="Loading" />
        ))}
      <NameHeader>
        {getTitle(data) || id}
        {inSearch && '→'}
      </NameHeader>
    </NameWrapper>
  );

  return (
    <TitleRowWrapper>
      {!inSearch && (
        <div
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            width: backWidth,
          }}
        >
          <Space>
            <Tooltip
              content={`All ${getResourceTypeTitle(type)?.toLowerCase()}`}
            >
              <Button
                icon="ArrowBack"
                onClick={() =>
                  history.push(createLink(`/explore/search/${type}`))
                }
              />
            </Tooltip>
            <Divider type="vertical" style={{ height: '36px' }} />
          </Space>
        </div>
      )}
      <div
        style={{
          display: 'inline-block',
          overflow: 'hidden',
          width: nameWidth,
          verticalAlign: 'bottom',
        }}
      >
        {inSearch ? (
          <Link
            style={{ color: 'var(--cogs-primary)' }}
            to={createLink(`/explore/${type}/${id}`, { [SEARCH_KEY]: query })}
            onClick={() => trackUsage('Exploration.FullPage', { type, id })}
          >
            {name}{' '}
          </Link>
        ) : (
          name
        )}
      </div>
      <div
        style={{
          display: 'inline-block',
          overflow: 'hidden',
          width: actionWidth,
        }}
      >
        <TitleRowActions
          item={{ type, id }}
          beforeDefaultActions={beforeDefaultActions}
          afterDefaultActions={afterDefaultActions}
        />
      </div>
    </TitleRowWrapper>
  );
}

export const TitleRowWrapper = styled.div`
  h1 {
    margin: 0;
  }
  margin: 16px 0px;
  padding-left: 16px;
  border-bottom: 1px solid ${lightGrey};
  padding-bottom: 10px;
`;

const NameWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const NameHeader = styled.h1`
  color: inherit;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
