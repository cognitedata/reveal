import EmptyState from 'components/emptyState';
import { DocumentContentAppliedFilters } from 'pages/authorized/search/document/header/DocumentContentAppliedFilters';

import { AppliedFilterWrapper } from './element';

interface Props {
  isLoading?: boolean;
}
export const NoResults: React.FC<Props> = ({ isLoading }) => {
  return (
    <EmptyState isLoading={isLoading}>
      <AppliedFilterWrapper>
        <DocumentContentAppliedFilters />
      </AppliedFilterWrapper>
    </EmptyState>
  );
};
