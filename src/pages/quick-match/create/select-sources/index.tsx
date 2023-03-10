import { Flex } from '@cognite/cogs.js';

import QuickMatchTitle from 'components/quick-match-title';
import SourceSelectionTable from 'components/source-selector-table';

const SelectSources = (): JSX.Element => {
  return (
    <Flex direction="column" gap={8}>
      <QuickMatchTitle step="select-sources" />
      <SourceSelectionTable />
    </Flex>
  );
};

export default SelectSources;
