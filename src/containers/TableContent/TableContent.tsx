import React from 'react';

import { Colors, Flex, Icon, Tabs } from '@cognite/cogs.js';
import styled from 'styled-components';

import { Spreadsheet } from 'containers/Spreadsheet';
import { TableHeader } from 'components/TableHeader';
import { Profiling } from 'containers/Profiling';

import { TAB_HEIGHT } from 'utils/constants';
import { useFullProfile } from 'hooks/profiling-service';
import { useIsTableEmpty } from 'hooks/table-data';
import { useActiveTableContext } from 'contexts';

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
        tabPosition="top"
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
          tab={<TabProfiling isFetching={isFetching} isEmpty={isEmpty} />}
          style={{ overflow: 'auto' }}
          disabled={isEmpty}
        >
          <Profiling key={`${database}_${table}`} />
        </Tabs.TabPane>
      </StyledTabs>
    </Wrapper>
  );
};

const TabSpreadsheet = (): JSX.Element => (
  <Tab>
    <Icon type="DataTable" />
    Table
  </Tab>
);
const TabProfiling = ({
  isFetching,
  isEmpty,
}: {
  isFetching: boolean;
  isEmpty: boolean;
}): JSX.Element => (
  <Tab $isEmpty={isEmpty}>
    <Icon type={isFetching ? 'Loader' : 'Profiling'} />
    Profile
  </Tab>
);

const Wrapper = styled(Flex)`
  height: calc(100% - ${TAB_HEIGHT}px);
  width: 100%;
`;

const TopBar = styled(Flex)`
  height: 64px;
  box-sizing: border-box;
  border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
`;

const Tab = styled.span<{ $isEmpty?: boolean }>`
  display: inline-flex;
  align-content: center;
  line-height: 17px;
  font-weight: 500;
  font-size: 14px;
  color: ${({ $isEmpty = false }) =>
    $isEmpty
      ? Colors['greyscale-grey-5'].hex()
      : Colors['greyscale-grey7'].hex()};
`;

const StyledTabs = styled(Tabs)`
  width: 100%;
  .rc-tabs-nav,
  .rc-tabs-content {
    height: 100%;
  }
`;

export default TableContent;
