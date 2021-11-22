import React from 'react';

import { Colors, Flex, Icon, Tabs } from '@cognite/cogs.js';
import styled from 'styled-components';

import { useActiveTable } from 'hooks/table-tabs';
import { Spreadsheet } from 'containers/Spreadsheet';
import { TableHeader } from 'components/TableHeader';
import { Profiling } from 'containers/Profiling';

import { TAB_HEIGHT } from 'utils/constants';
import { useRawProfile } from 'hooks/sdk-queries';

const TableContent = () => {
  const [[database, table, view] = [], update] = useActiveTable();
  const { isFetching } = useRawProfile(
    { database: database!, table: table! },
    { enabled: !!database && !!table }
  );
  return (
    <Wrapper>
      <StyledTabs
        onChange={(view) => update([database!, table!, view])}
        activeKey={view || 'stylesheet'}
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
          key="stylesheet"
          tab={<TabSpreadsheet />}
          style={{ overflow: 'auto' }}
        >
          <Spreadsheet />
        </Tabs.TabPane>
        <Tabs.TabPane
          key="profiling"
          tab={<TabProfiling isFetching={isFetching} />}
        >
          <Profiling />
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
