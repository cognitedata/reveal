import { useState } from 'react';

import { Button, Dropdown, Flex, Menu, Tabs, Tooltip } from '@cognite/cogs.js';

import { UpsertDataScopeModal, UpsertRuleDrawer } from '..';
import { SplitPanel } from '../../../../../components/Layouts/elements';
import { useTranslation } from '../../../../../hooks/useTranslation';
import {
  AccessAction,
  useAccessControl,
  useDisclosure,
  useLoadDataSource,
} from '../../hooks';

import { DataScopesTable, RulesTable, TotalValidityCard } from './components';

type TabKey = 'rules' | 'dataScopes';

export const DataQualityOverview = () => {
  const { t } = useTranslation('DataQualityOverview');

  const [tabActiveKey, setTabActiveKey] = useState<TabKey>('rules');

  const upsertRuleDrawer = useDisclosure({ isOpen: false });
  const upsertDataScopeModal = useDisclosure({ isOpen: false });

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
                    {t('data_quality_new_rule', '')}
                  </Menu.Item>
                  <Menu.Item
                    disabled={!canCreate}
                    onClick={upsertDataScopeModal.onOpen}
                  >
                    {t('data_quality_new_data_scope', '')}
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

      <UpsertDataScopeModal
        isVisible={upsertDataScopeModal.isOpen}
        onCancel={upsertDataScopeModal.onClose}
      />
    </SplitPanel>
  );
};
