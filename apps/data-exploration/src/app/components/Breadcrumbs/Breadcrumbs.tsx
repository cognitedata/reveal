import { useLocation, useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { createLink } from '@cognite/cdf-utilities';
import { Breadcrumbs as Breadcrumb } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

import { getSearchParams, removeProjectFromPath } from '../../utils/URLUtils';

type BreadcrumbsProps = {
  currentResource: {
    title: string;
  };
};

// TODO: We have a new version `BreadcrumbsV2`, can remove this file after new navigation adoption.
export const Breadcrumbs = ({ currentResource }: BreadcrumbsProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const handleBreadcrumbClick = (path: string, index: number) => {
    // Keep history until the clicked item
    const history = [...(location.state?.history || [])];
    history.splice(index, history.length - index);

    const search = getSearchParams(location.search);
    navigate(createLink(removeProjectFromPath(path), search), {
      state: {
        history,
      },
      replace: true,
    });
  };

  return (
    <BreadcrumbWrapper>
      <Breadcrumb>
        <Breadcrumb.Item label={t('SEARCH', 'Search')} link="" />
        {location.state?.history?.map(
          ({ path, resource }: any, index: number) => (
            <Breadcrumb.Item
              key={`${path}-${index}`}
              label={resource.title}
              onClick={() => {
                handleBreadcrumbClick(path, index);
              }}
              link=""
            />
          )
        )}
        <Breadcrumb.Item label={currentResource.title} />
      </Breadcrumb>
    </BreadcrumbWrapper>
  );
};

const BreadcrumbWrapper = styled.div`
  border-bottom: 1px solid var(--cogs-border--muted);
  padding: 8px 16px;

  ol {
    margin: 0;
    padding: 0;
  }

  /* disable Search field */
  li:first-child,
  li:last-child {
    button {
      pointer-events: none;
      color: var(--cogs-text-icon--strong);
    }
  }
  .cogs-breadcrumbs__item {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`;
