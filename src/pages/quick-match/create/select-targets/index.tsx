import { Flex } from '@cognite/cogs.js';

import QuickMatchTitle from 'components/quick-match-title';
import TargetSelectionTable from 'components/target-selector-table';

const SelectTargets = (): JSX.Element => {
  return (
    <Flex direction="column" gap={8}>
      <QuickMatchTitle step="select-targets" />
      <TargetSelectionTable />
    </Flex>
  );
};

export default SelectTargets;
