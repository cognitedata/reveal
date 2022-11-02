import React from 'react';
import { ResourceItem } from '@cognite/data-exploration';
import { createLink } from '@cognite/cdf-utilities';
import { Button } from '@cognite/cogs.js';
import isArray from 'lodash/isArray';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { DateFilter } from 'app/components/ResourceTitleRow';
import { useCurrentResourceId, useQueryString } from 'app/hooks/hooks';
import { SEARCH_KEY } from 'app/utils/constants';
import { trackUsage } from 'app/utils/Metrics';
import DownloadButton from './DownloadButton';
import { MoreButton } from './MoreButton';

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
      {
        state: {
          history: location.state?.history,
        },
      }
    );
  };

  const goToFullPagePreview = () => {
    navigate(
      createLink(`/explore/${item.type}/${item.id}`, {
        [SEARCH_KEY]: query,
      }),
      {
        state: {
          history: location.state?.history,
        },
      }
    );
    trackUsage('Exploration.FullPage', item);
  };

  const closePreview = () => {
    openPreview(undefined);
  };

  const closeFullPagePreview = () => {
    if (!location.state?.history || location.state?.history?.length === 0) {
      navigate(
        createLink(`/explore/search/${item.type}`, {
          [SEARCH_KEY]: query,
        }),
        { replace: true }
      );
      return;
    }

    navigate(
      location.state.history[location.state.history.length - 1].path +
        location.search,
      {
        state: {
          history:
            isArray(location.state?.history) &&
            location.state.history.slice(0, -1),
        },
      }
    );
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
