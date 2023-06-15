import React from 'react';

import styled from 'styled-components';

import { useTranslation } from '@raw-explorer/common/i18n';
import { TableHeader } from '@raw-explorer/components/TableHeader';
import { Profiling } from '@raw-explorer/containers/Profiling';
import { Spreadsheet } from '@raw-explorer/containers/Spreadsheet';
import { useActiveTableContext } from '@raw-explorer/contexts';
import { useFullProfile } from '@raw-explorer/hooks/profiling-service';
import { useIsTableEmpty } from '@raw-explorer/hooks/table-data';
import { TAB_HEIGHT } from '@raw-explorer/utils/constants';
import { Tabs as AntdTabs } from 'antd';

import { Colors, Flex, Icon } from '@cognite/cogs.js';

const { TabPane } = AntdTabs;

const TableContent = () => {
  const { database, table, view, update } = useActiveTableContext();
  const { isFetching } = useFullProfile({ database, table });
  const isEmpty = useIsTableEmpty(database, table);

  return (
    <Wrapper>
      <StyledTabs
        key={`${database}_${table}`}
        onChange={(view) => update([database, table, view])}
        activeKey={view || 'spreadsheet'}
        renderTabBar={(props, TabBarComponent) => (
          <TopBar justifyContent="space-between" alignItems="center">
            <TableHeader title={database} subtitle={table} />
            <TabBarComponent {...props} />
          </TopBar>
        )}
      >
        <TabPane
          key="spreadsheet"
          tab={<TabSpreadsheet key={`${database}_${table}`} />}
          style={{ overflow: 'auto' }}
        >
          <Spreadsheet />
        </TabPane>

        <TabPane
          key="profiling"
          tab={<TabProfiling isFetching={isFetching} isEmpty={isEmpty} />}
          style={{ overflow: 'auto' }}
        >
          <Profiling key={`${database}_${table}`} />
        </TabPane>
      </StyledTabs>
    </Wrapper>
  );
};

const TabSpreadsheet = (): JSX.Element => {
  const { t } = useTranslation();
  return (
    <Tab>
      <Icon type="DataTable" />
      {t('tab-table')}
    </Tab>
  );
};

const TabProfiling = ({
  isFetching,
  isEmpty,
}: {
  isFetching: boolean;
  isEmpty: boolean;
}): JSX.Element => {
  const { t } = useTranslation();
  return (
    <Tab $isEmpty={isEmpty}>
      <Icon type={isFetching ? 'Loader' : 'Profiling'} />
      {t('tab-profile')}
    </Tab>
  );
};

const Wrapper = styled(Flex)`
  height: calc(100% - ${TAB_HEIGHT}px);
  width: 100%;
`;

const TopBar = styled(Flex)`
  height: 64px;
  box-sizing: border-box;
  border-bottom: 1px solid ${Colors['border--interactive--default']};
`;

const Tab = styled.span<{ $isEmpty?: boolean }>`
  display: inline-flex;
  align-content: center;
  line-height: 17px;
  font-weight: 500;
  font-size: 14px;
  color: ${({ $isEmpty = false }) =>
    $isEmpty
      ? Colors['text-icon--interactive--disabled']
      : Colors['text-icon--medium']};
`;

const StyledTabs = styled(AntdTabs)`
  width: 100%;

  .ant-tabs-content {
    height: 100%;
  }

  .ant-tabs-nav {
    padding-left: 10px;
  }

  .ant-tabs-tabpane {
    height: 100%;
  }
`;
export default TableContent;
