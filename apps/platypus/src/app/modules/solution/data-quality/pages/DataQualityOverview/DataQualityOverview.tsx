import { SplitPanel } from '@platypus-app/components/Layouts/elements';

import { Flex } from '@cognite/cogs.js';

import { RulesTable, TotalValidityCard } from './components';

export const DataQualityOverview = () => {
  return (
    <SplitPanel>
      <Flex
        className="split-panel-content"
        direction="column"
        gap={32}
        style={{ padding: '1rem 2rem' }}
      >
        <TotalValidityCard />
        <RulesTable />
      </Flex>
    </SplitPanel>
  );
};
