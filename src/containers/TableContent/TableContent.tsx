import React from 'react';

import { Colors, Flex, Icon, Tabs } from '@cognite/cogs.js';
import styled from 'styled-components';

import { useActiveTable } from 'hooks/table-tabs';
import { Spreadsheet } from 'containers/Spreadsheet';
import { TableHeader } from 'components/TableHeader';
import { Profiling } from 'containers/Profiling';

import { TAB_HEIGHT } from 'utils/constants';

const TableContent = () => {
  const [[database, table] = [undefined, undefined]] = useActiveTable();

  return (
    <Wrapper>
      <StyledTabs
        tabPosition="top"
        animated={{ tabPane: true }}
        renderTabBar={(props, TabBarComponent) => (
          <TopBar justifyContent="space-between" alignItems="center">
            <TableHeader
              title={database ?? ''}
              subtitle={table && `${table}.csv`}
            />
            <TabBarComponent {...props} />
          </TopBar>
        )}
      >
        <Tabs.TabPane
          key="tab-stylesheet"
          tab={<TabSpreadsheet />}
          style={{ overflow: 'auto' }}
        >
          <Spreadsheet />
        </Tabs.TabPane>
        <Tabs.TabPane key="tab-profiling" tab={<TabProfiling />}>
          <Profiling />
        </Tabs.TabPane>
      </StyledTabs>
    </Wrapper>
  );
};

const TabSpreadsheet = (): JSX.Element => (
  <Flex>
    <Icon type="DataTable" />
    Table
  </Flex>
);
const TabProfiling = (): JSX.Element => (
  <span>
    <Icon type="Profiling" />
    Profile
  </span>
);

const Wrapper = styled(Flex)`
  border-left: 1px solid ${Colors['greyscale-grey3'].hex()};
  height: calc(100% - ${TAB_HEIGHT}px);
  width: 100%;
`;

const TopBar = styled(Flex)`
  height: 64px;
  box-sizing: border-box;
  border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
`;

const StyledTabs = styled(Tabs)`
  width: 100%;
  .rc-tabs-nav,
  .rc-tabs-content {
    height: 100%;
  }
`;

export default TableContent;
