import React from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';
import { Icon, Button, Colors } from '@cognite/cogs.js';
import {
  convertResourceType,
  ResourceItem,
  ResourceIcons,
} from '@cognite/data-exploration';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import styled from 'styled-components';
import { trackUsage } from 'app/utils/Metrics';
import { useQueryString } from 'app/hooks';
import { SEARCH_KEY } from 'app/utils/constants';
import { Divider, Space } from 'antd';
import { TitleRowActions } from './TitleRowActions';

type Props = {
  item: ResourceItem;
  getTitle?: (_: any) => string | undefined;
  beforeDefaultActions?: React.ReactNode;
  afterDefaultActions?: React.ReactNode;
};

export default function ResourceTitleRow({
  item: { type, id },
  getTitle = (i: any) => i?.name,
  beforeDefaultActions,
  afterDefaultActions,
}: Props) {
  const { data, isFetched } = useCdfItem<{ name?: string }>(
    convertResourceType(type),
    {
      id,
    }
  );

  const navigate = useNavigate();
  const location = useLocation();
  const isPreview =
    location.pathname.includes('/search') ||
    location.pathname.includes('/threeD');
  const [query] = useQueryString(SEARCH_KEY);

  const name = (
    <NameWrapper>
      {!isPreview &&
        (isFetched ? (
          <ResourceIcons type={type} style={{ marginRight: '10px' }} />
        ) : (
          <Icon type="Loader" />
        ))}
      <NameHeader>
        {getTitle(data) || id}
        {isPreview && '→'}
      </NameHeader>
    </NameWrapper>
  );

  return (
    <TitleRowWrapper
      style={isPreview ? { maxWidth: 'calc(100vw - 480px)' } : {}}
    >
      {!isPreview && (
        <div
          style={{
            overflow: 'hidden',
            flex: '0 0 auto',
          }}
        >
          <Space>
            {/* Go back */}
            <Button icon="ArrowLeft" onClick={() => navigate(-1)} />
            <Divider type="vertical" style={{ height: '36px' }} />
          </Space>
        </div>
      )}
      <div
        style={{
          overflow: 'hidden',
          verticalAlign: 'bottom',
          flex: '1 1 auto',
        }}
      >
        {isPreview ? (
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
          overflow: 'hidden',
          flex: '0 0 auto',
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
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  margin: 16px 0px;
  padding-left: 16px;
  border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
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
