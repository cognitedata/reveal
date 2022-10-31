import React from 'react';
import { ResourceItem } from '@cognite/data-exploration';
import DownloadButton from './DownloadButton';
import { MoreButton } from './MoreButton';
import styled from 'styled-components';
import { DateFilter } from 'app/components/ResourceTitleRow';
import { Button } from '@cognite/cogs.js';
import { createLink } from '@cognite/cdf-utilities';
import { useCurrentResourceId, useQueryString } from 'app/hooks/hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import { SEARCH_KEY } from 'app/utils/constants';
import { trackUsage } from 'app/utils/Metrics';

type TitleRowActionsProps = {
  item: ResourceItem;
  beforeDefaultActions?: React.ReactNode;
  afterDefaultActions?: React.ReactNode;
  dateFilter?: DateFilter;
  hideDefaultCloseActions?: boolean;
};

export const TitleRowActions = ({
  item,
  dateFilter,
  afterDefaultActions,
  beforeDefaultActions,
  hideDefaultCloseActions,
}: TitleRowActionsProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query] = useQueryString(SEARCH_KEY);
  const [activeId, openPreview] = useCurrentResourceId();

  const isPreview = location.pathname.includes('/search');

  const goToPreview = () => {
    navigate(
      createLink(`/explore/search/${item.type}/${item.id}`, {
        [SEARCH_KEY]: query,
      }),
      { state: { prevPath: location.pathname } }
    );
  };

  const goToFullPagePreview = () => {
    navigate(
      createLink(`/explore/${item.type}/${item.id}`, {
        [SEARCH_KEY]: query,
      }),
      { state: { prevPath: location.pathname } }
    );
    trackUsage('Exploration.FullPage', item);
  };

  const closePreview = () => {
    openPreview(undefined);
  };

  const closeFullPagePreview = () => {
    if ((location.state as any)?.prevPath.includes(item.id)) {
      navigate(
        createLink(`/explore/search/${item.type}`, {
          [SEARCH_KEY]: query,
        }),
        { replace: true }
      );
      return;
    }

    const isInitialPage = location.key === 'default';
    const prevLinkDefault = location.pathname.replace(
      'explore/',
      'explore/search/'
    );
    isInitialPage ? navigate(prevLinkDefault + location.search) : navigate(-1);
  };

  if (item.type === 'threeD') {
    return <StyledSpace>{afterDefaultActions}</StyledSpace>;
  }

  return (
    <StyledSpace>
      {beforeDefaultActions}
      <DownloadButton item={item} dateFilter={dateFilter} />
      <MoreButton item={item} />
      {afterDefaultActions}
      {!hideDefaultCloseActions && activeId && (
        <>
          <Divider />
          <Button
            icon={isPreview ? 'Expand' : 'Collapse'}
            aria-label="Toggle fullscreen"
            onClick={() => (isPreview ? goToFullPagePreview() : goToPreview())}
          />
          <Button
            icon="Close"
            aria-label="Close"
            onClick={() =>
              isPreview ? closePreview() : closeFullPagePreview()
            }
          />
        </>
      )}
    </StyledSpace>
  );
};

const StyledSpace = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
  float: right;
`;

const Divider = styled.div`
  width: 1px;
  height: 16px;
  background-color: var(--cogs-border--muted);
`;
