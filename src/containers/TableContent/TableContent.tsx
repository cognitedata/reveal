import React from 'react';

import { Colors, Flex, Tabs } from '@cognite/cogs.js';
import styled from 'styled-components';

import { Spreadsheet } from 'containers/Spreadsheet';
import { TableHeader } from 'components/TableHeader';
import { Profiling } from 'containers/Profiling';

import { TAB_HEIGHT } from 'utils/constants';
import { useFullProfile } from 'hooks/profiling-service';
import { useIsTableEmpty } from 'hooks/table-data';
import { useActiveTableContext } from 'contexts';
import { useTranslation } from 'common/i18n';

const TableContent = () => {
  const { database, table, view, update } = useActiveTableContext();
  const { isFetching } = useFullProfile({ database, table });
  const isEmpty = useIsTableEmpty(database, table);
  const { t } = useTranslation();

  return (
    // <Wrapper>
    <StyledTabs
      css={{ width: '100%' }}
      key={`${database}_${table}`}
      onTabClick={(view, _) => update([database, table, view])}
      activeKey={view || 'spreadsheet'}
      tabPosition="top"
    >
      <TopBar justifyContent="space-between" alignItems="center">
        <TableHeader title={database} subtitle={table} />
      </TopBar>
      {/* <span
        css={{
          float: 'right',
          right: 0,
          backgroundColor: 'red',
          display: 'Flex',
        }}
      > */}
      <Tabs.Tab
        tabKey="spreadsheet"
        iconLeft="DataTable"
        label={t('tab-table')}
      >
        <Spreadsheet />
      </Tabs.Tab>

      <Tabs.Tab
        tabKey="profiling"
        iconLeft={isFetching ? 'Loader' : 'Profiling'}
        label={t('tab-profile')}
        disabled={isEmpty}
      >
        <Wrapper>
          <Profiling key={`${database}_${table}`} />
        </Wrapper>
      </Tabs.Tab>
    </StyledTabs>
    // </Wrapper>
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
  background-color: purple;
  float: left;
  left: 0;
`;

const StyledTabs = styled(Tabs)`
  &&& {
    right: 0;
    background-color: red;
  }
`;
export default TableContent;
