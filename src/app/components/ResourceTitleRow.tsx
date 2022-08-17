import React from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';
import { Icon, Button, Colors } from '@cognite/cogs.js';

import {
  convertResourceThreeDWrapper,
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
import { DatapointsMultiQuery } from '@cognite/sdk';

export type DateFilter = Pick<DatapointsMultiQuery, 'start' | 'end'>;
type Props = {
  title?: string;
  item: ResourceItem;
  datefilter?: DateFilter;
  getTitle?: (_: any) => string | undefined;
  beforeDefaultActions?: React.ReactNode;
  afterDefaultActions?: React.ReactNode;
};

export default function ResourceTitleRow({
  title,
  item: { type, id },
  datefilter,
  getTitle = (i: any) => i?.name,
  beforeDefaultActions,
  afterDefaultActions,
}: Props) {
  const { data, isFetched } = useCdfItem<{ name?: string }>(
    convertResourceThreeDWrapper(type),
    {
      id,
    }
  );

  const navigate = useNavigate();
  const location = useLocation();
  const isInitialPage = location.key === 'default';

  const prevLinkDefault = location.pathname.replace(
    'explore/',
    'explore/search/'
  );

  const isPreview = location.pathname.includes('/search');
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
        {title || getTitle(data) || id}
        {isPreview && '→'}
      </NameHeader>
    </NameWrapper>
  );

  return (
    <TitleRowWrapper
      style={isPreview ? { maxWidth: 'calc(100vw - 480px)' } : {}}
    >
      {!isPreview && (
        <StyledGoBackWrapper>
          <Space>
            {/* Go back */}

            <Button
              icon="ArrowLeft"
              onClick={() =>
                isInitialPage
                  ? navigate(prevLinkDefault + location.search)
                  : navigate(-1)
              }
            />

            <Divider type="vertical" style={{ height: '36px' }} />
          </Space>
        </StyledGoBackWrapper>
      )}
      <PreviewLinkWrapper>
        {isPreview ? (
          <StyledLink
            to={createLink(`/explore/${type}/${id}`, {
              [SEARCH_KEY]: query,
            })}
            state={{ prevPath: location.pathname }}
            onClick={() => trackUsage('Exploration.FullPage', { type, id })}
          >
            {name}{' '}
          </StyledLink>
        ) : (
          name
        )}
      </PreviewLinkWrapper>
      <StyledGoBackWrapper>
        <TitleRowActions
          dateFilter={datefilter}
          item={{ type, id }}
          beforeDefaultActions={beforeDefaultActions}
          afterDefaultActions={afterDefaultActions}
        />
      </StyledGoBackWrapper>
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

const StyledGoBackWrapper = styled.div`
  overflow: hidden;
  flex: 0 0 auto;
`;

const PreviewLinkWrapper = styled.div`
  overflow: hidden;
  vertical-align: bottom;
  flex: 1 1 auto;
`;

const StyledLink = styled(Link)`
  color: var(--cogs-primary);
`;
