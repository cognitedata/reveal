import { SplitPanel } from '@platypus-app/components/Layouts/elements';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Flex, Tabs } from '@cognite/cogs.js';

import {
  DataScopesTable,
  DownloadReport,
  RulesTable,
  TotalValidityCard,
} from './components';

export const DataQualityOverview = () => {
  const { t } = useTranslation('DataQualityOverview');

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

        <Tabs>
          <Tabs.Tab
            label={t('data_quality_rule', 'Rules', { count: 0 })}
            key="rules"
            tabKey="rules"
          >
            <RulesTable />
          </Tabs.Tab>
          <Tabs.Tab
            label={t('data_quality_data_scope', 'Data scopes', { count: 0 })}
            key="dataScopes"
            tabKey="dataScopes"
          >
            <DataScopesTable />
          </Tabs.Tab>
        </Tabs>
      </Flex>
    </SplitPanel>
  );
};
