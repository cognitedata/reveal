import { SplitPanel } from '@platypus-app/components/Layouts/elements';

import { Flex } from '@cognite/cogs.js';

import { RulesTable } from './components';

export const DataQualityOverview = () => {
  return (
    <SplitPanel>
      <Flex
        className="split-panel-content"
        direction="column"
        style={{ padding: '1rem 2rem' }}
      >
        <RulesTable />
      </Flex>
    </SplitPanel>
  );
};
