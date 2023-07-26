import styled from 'styled-components';

import AppListItem from './AppListItem';
import EmptyState from './EmptyState';
import { ItemWithSection } from './types';

type ApplicationsProps = {
  items: ItemWithSection[];
  query: string | undefined;
};

const Applications = ({ items, query }: ApplicationsProps) => {
  if (!items?.length) return <EmptyState query={query} />;

  return (
    <StyledGrid>
      {items.map((app) => (
        <AppListItem
          app={app}
          section={app.section}
          key={`cdf-app-${app.internalId}`}
        />
      ))}
    </StyledGrid>
  );
};

const StyledGrid = styled.div`
  flex: 1;
  display: grid;
  gap: 25px;
  grid-template-columns: repeat(auto-fill, 256px);
`;

export default Applications;
