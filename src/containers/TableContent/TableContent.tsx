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
    <Wrapper>
      <StyledTabs
        key={`${database}_${table}`}
        onTabClick={(view, _) => update([database, table, view])}
        activeKey={view || 'spreadsheet'}
        tabPosition="top"
      >
        <TopBar justifyContent="space-between" alignItems="center">
          <TableHeader title={database} subtitle={table} />
        </TopBar>
        <StyledTab
          tabKey="spreadsheet"
          iconLeft="DataTable"
          label={t('tab-table')}
          style={{ overflow: 'auto' }}
        >
          <Spreadsheet />
        </StyledTab>
        <StyledTab
          tabKey="profiling"
          iconLeft={isFetching ? 'Loader' : 'Profiling'}
          label={t('tab-profile')}
          style={{ overflow: 'auto', display: 'inline-flex' }}
          disabled={isEmpty}
        >
          <Profiling key={`${database}_${table}`} />
        </StyledTab>
      </StyledTabs>
      <div css={{ backgroundColor: 'green', width: '100%' }}>'test'</div>
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  height: calc(100% - ${TAB_HEIGHT}px);
  width: 100%;
  flex-wrap: wrap;
`;

const TopBar = styled(Flex)`
  height: 64px;
  box-sizing: border-box;
  border-bottom: 1px solid ${Colors['border--interactive--default']};
  background-color: purple;
`;

const StyledTabs = styled(Tabs)`
  width: 100%;
  background-color: blue !important;
  flex: 1;
  .cogs.cogs-tabs {
    background-color: orange;
    width: 100% !important;
  }
  .rc-tabs-nav {
    width: 100%;
  }
  ,
  .rc-tabs-content {
    height: 100%;
    width: 100% !important;
  }
`;

const StyledTab = styled(Tabs.Tab)`
  height: 100%;
  width: 100%;
  background-color: purple;
`;

export default TableContent;
