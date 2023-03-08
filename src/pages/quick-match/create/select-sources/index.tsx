import { Flex } from '@cognite/cogs.js';

import QuickMatchTitle from 'components/quick-match-title';
import ResourceSelectionTable from 'components/resource-selector-table';

const SelectSources = (): JSX.Element => {
  return (
    <Flex direction="column" gap={8}>
      <QuickMatchTitle step="select-sources" />
      <ResourceSelectionTable />
    </Flex>
  );
};

export default SelectSources;
