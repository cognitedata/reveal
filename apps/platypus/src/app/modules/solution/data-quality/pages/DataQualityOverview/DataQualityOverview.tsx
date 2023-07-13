import { SplitPanel } from '@platypus-app/components/Layouts/elements';

import { Flex } from '@cognite/cogs.js';

import { DownloadReport, RulesTable, TotalValidityCard } from './components';

export const DataQualityOverview = () => {
  return (
    <SplitPanel>
      <Flex
        className="split-panel-content"
        direction="column"
        gap={32}
        style={{ padding: '1rem 2rem' }}
      >
        <Flex
          alignItems="flex-start"
          direction="row"
          justifyContent="space-between"
        >
          <TotalValidityCard />
          <DownloadReport />
        </Flex>

        <RulesTable />
      </Flex>
    </SplitPanel>
  );
};
