import EmptyState from 'components/emptyState';
import { DocumentContentAppliedFilters } from 'pages/authorized/search/document/header/DocumentContentAppliedFilters';
import { FlexAlignJustifyContent } from 'styles/layout';

interface Props {
  isLoading?: boolean;
}
export const NoResults: React.FC<Props> = ({ isLoading }) => {
  return (
    <EmptyState isLoading={isLoading}>
      <FlexAlignJustifyContent>
        <DocumentContentAppliedFilters />
      </FlexAlignJustifyContent>
    </EmptyState>
  );
};
