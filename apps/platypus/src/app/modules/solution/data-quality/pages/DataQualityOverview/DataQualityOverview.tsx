import { useState } from 'react';

import {
  AccessAction,
  useAccessControl,
  useDisclosure,
  useLoadDataSource,
} from '@data-quality/hooks';
import { SplitPanel } from '@platypus-app/components/Layouts/elements';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Button, Dropdown, Flex, Menu, Tabs, Tooltip } from '@cognite/cogs.js';

import { UpsertRuleDrawer } from '..';

import { DataScopesTable, RulesTable, TotalValidityCard } from './components';

type TabKey = 'rules' | 'dataScopes';

export const DataQualityOverview = () => {
  const { t } = useTranslation('DataQualityOverview');

  const [tabActiveKey, setTabActiveKey] = useState<TabKey>('rules');

  const upsertRuleDrawer = useDisclosure({ isOpen: false });

  const { dataSource, isLoading: isLoadingDataSource } = useLoadDataSource();
  const {
    isLoading: isLoadingAccess,
    canWriteDataValidation,
    useErrorMessage,
  } = useAccessControl();

  const accessErrorMessageWrite = useErrorMessage(
    AccessAction.WRITE_DATA_VALIDATION
  );

  const canCreate = dataSource && canWriteDataValidation;
  const isLoading = isLoadingAccess || isLoadingDataSource;

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
        </Flex>
        <Flex direction="row" justifyContent="space-between">
          <Tabs
            activeKey={tabActiveKey}
            onTabClick={(key) => setTabActiveKey(key as TabKey)}
          >
            <Tabs.Tab
              label={t('data_quality_rule', 'Rules', { count: 0 })}
              key="rules"
              tabKey="rules"
            />
            <Tabs.Tab
              label={t('data_quality_data_scope', 'Data scopes', { count: 0 })}
              key="dataScopes"
              tabKey="dataScopes"
            />
          </Tabs>

          <Tooltip
            content={accessErrorMessageWrite}
            disabled={canWriteDataValidation}
            wrapped
          >
            <Dropdown
              content={
                <Menu loading={isLoading}>
                  <Menu.Item
                    disabled={!canCreate}
                    onClick={upsertRuleDrawer.onOpen}
                  >
                    {t('data_quality_new_rule', 'New rule')}
                  </Menu.Item>
                </Menu>
              }
              hideOnClick
            >
              <Button
                disabled={!canCreate}
                icon="AddLarge"
                iconPlacement="right"
                loading={isLoading}
                type="primary"
              >
                {t('data_quality_create', 'Create')}
              </Button>
            </Dropdown>
          </Tooltip>
        </Flex>

        {tabActiveKey === 'rules' ? <RulesTable /> : <DataScopesTable />}
      </Flex>

      <UpsertRuleDrawer
        isVisible={upsertRuleDrawer.isOpen}
        onCancel={upsertRuleDrawer.onClose}
      />
    </SplitPanel>
  );
};
