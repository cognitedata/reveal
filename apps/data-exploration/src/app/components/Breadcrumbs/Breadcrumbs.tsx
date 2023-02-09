import { createLink } from '@cognite/cdf-utilities';
import { Breadcrumb } from '@cognite/cogs.js';
import {
  getSearchParams,
  removeProjectFromPath,
} from '@data-exploration-app/utils/URLUtils';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type BreadcrumbsProps = {
  currentResource: {
    title: string;
  };
};

export const Breadcrumbs = ({ currentResource }: BreadcrumbsProps) => {
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
        <Breadcrumb.Item title="Search" link={''} />
        {location.state?.history?.map(
          ({ path, resource }: any, index: number) => (
            <Breadcrumb.Item
              key={`${path}-${index}`}
              title={resource.title}
              onClick={(e) => {
                e.preventDefault();
                handleBreadcrumbClick(path, index);
              }}
              link=""
            />
          )
        )}
        <Breadcrumb.Item title={currentResource.title} link={''} />
      </Breadcrumb>
    </BreadcrumbWrapper>
  );
};

const BreadcrumbWrapper = styled.div`
  border-bottom: 1px solid var(--cogs-border--muted);
  padding: 8px 16px;

  .cogs-breadcrumb {
    margin: 0;
    padding: 0;
  }

  /* disable Search field */
  li:first-child {
    a {
      pointer-events: none;
      color: var(--cogs-text-icon--strong);
    }
  }
`;
