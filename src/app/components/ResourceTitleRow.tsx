import React from 'react';

import { Link, useLocation } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';
import { Icon } from '@cognite/cogs.js';
import { convertResourceType, ResourceItem, ResourceIcons } from 'lib';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import styled from 'styled-components';
import { lightGrey } from 'lib/utils/Colors';
import { trackUsage } from 'app/utils/Metrics';
import { TitleRowActions } from './TitleRowActions';

type Props = {
  item: ResourceItem;
  getTitle?: (_: any) => string | undefined;
  beforeDefaultActions?: React.ReactNode;
  afterDefaultActions?: React.ReactNode;
  actionWidth?: number;
};

export default function ResourceTitleRow({
  item: { type, id },
  getTitle = (i: any) => i?.name,
  beforeDefaultActions,
  afterDefaultActions,
  actionWidth = 665,
}: Props) {
  const { data, isFetched } = useCdfItem<{ name?: string }>(
    convertResourceType(type),
    {
      id,
    }
  );
  const location = useLocation();
  const inSearch = location.pathname.includes('/search');

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
      <div
        style={{
          display: 'inline-block',
          overflow: 'hidden',
          width: `calc(100% - ${actionWidth}px)`,
          verticalAlign: 'bottom',
        }}
      >
        {inSearch ? (
          <Link
            style={{ color: 'var(--cogs-primary)' }}
            to={createLink(`/explore/${type}/${id}`)}
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
