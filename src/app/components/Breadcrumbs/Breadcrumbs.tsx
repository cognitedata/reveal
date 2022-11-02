import { createLink } from '@cognite/cdf-utilities';
import { Breadcrumb } from '@cognite/cogs.js';
import { removeProjectFromPath } from 'app/utils/URLUtils';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

type BreadcrumbsProps = {
  currentResource: {
    title: string;
  };
};

export const Breadcrumbs = ({ currentResource }: BreadcrumbsProps) => {
  const location = useLocation();

  return (
    <BreadcrumbWrapper>
      <Breadcrumb>
        <Breadcrumb.Item
          title="Search"
          link={createLink('/explore/search/asset')}
        />
        {location.state?.history?.map(
          ({ path, resource }: any, index: number) => (
            <Breadcrumb.Item
              key={`${path}-${index}`}
              title={resource.title}
              link={createLink(removeProjectFromPath(path))}
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
`;
