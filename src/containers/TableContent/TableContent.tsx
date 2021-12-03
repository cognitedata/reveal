import React from 'react';

import { Colors, Flex, Icon, Tabs } from '@cognite/cogs.js';
import styled from 'styled-components';

import { Spreadsheet } from 'containers/Spreadsheet';
import { TableHeader } from 'components/TableHeader';
import { Profiling } from 'containers/Profiling';

import { TAB_HEIGHT } from 'utils/constants';
import { useFullProfile } from 'hooks/profiling-service';
import { useActiveTableContext } from 'contexts';

const TableContent = () => {
  const { database, table, view, update } = useActiveTableContext();
  const { isFetching } = useFullProfile({ database, table });

  return (
    <Wrapper>
      <StyledTabs
        key={`${database}_${table}`}
        onChange={(view) => update([database, table, view])}
        activeKey={view || 'spreadsheet'}
        tabPosition="top"
        animated={{ tabPane: true }}
        renderTabBar={(props, TabBarComponent) => (
          <TopBar justifyContent="space-between" alignItems="center">
            <TableHeader title={database} subtitle={table} />
            <TabBarComponent {...props} />
          </TopBar>
        )}
      >
        <Tabs.TabPane
          key="spreadsheet"
          tab={<TabSpreadsheet key={`${database}_${table}`} />}
          style={{ overflow: 'auto' }}
        >
          <Spreadsheet />
        </Tabs.TabPane>
        <Tabs.TabPane
          key="profiling"
          tab={<TabProfiling isFetching={isFetching} />}
          style={{ overflow: 'auto' }}
        >
          <Profiling key={`${database}_${table}`} />
        </Tabs.TabPane>
      </StyledTabs>
    </Wrapper>
  );
};

const TabSpreadsheet = (): JSX.Element => (
  <Tab>
    <Icon type="Table" />
    Table
  </Tab>
);
const TabProfiling = ({ isFetching }: { isFetching: boolean }): JSX.Element => (
  <Tab>
    <Icon type={isFetching ? 'Loading' : 'Profiling'} />
    Profile
  </Tab>
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

const Tab = styled.span`
  font-weight: 500;
  font-size: 14px;
  color: ${Colors['greyscale-grey7'].hex()};
`;

const StyledTabs = styled(Tabs)`
  width: 100%;
  .rc-tabs-nav,
  .rc-tabs-content {
    height: 100%;
  }
`;

export default TableContent;
