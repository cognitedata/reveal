import { Label } from '@cognite/cogs.js';
import { ResourceTypeTitle, TabContainer } from './elements';
import { getTabCountLabel } from '@data-exploration-components/utils';
import { useDocumentFilteredAggregateCount } from '@data-exploration-lib/domain-layer';

type Props = {
  query?: string;
  filter?: any;
  showCount?: boolean;
};

// This is FilesTab with counts when advanced filters are enabled!
export const DocumentsTab = ({ query, filter, showCount = false }: Props) => {
  const { data: filteredDocumentCount = 0 } = useDocumentFilteredAggregateCount(
    { filters: filter, query }
  );

  return (
    <TabContainer>
      <ResourceTypeTitle>Files</ResourceTypeTitle>
      {showCount && (
        <Label size="small" variant="unknown">
          {getTabCountLabel(filteredDocumentCount)}
        </Label>
      )}
    </TabContainer>
  );
};
