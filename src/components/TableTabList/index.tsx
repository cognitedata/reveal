import React, { useContext } from 'react';
import styled from 'styled-components';
import { Colors, Button } from '@cognite/cogs.js';
import { Tabs as AntdTabs } from 'antd';

import {
  useActiveTable,
  useCloseTable,
  useTableTabList,
} from 'hooks/table-tabs';
import { RawExplorerContext } from 'contexts';
import { getContainer, getTableTabKey } from 'utils/utils';
import TableTabListTitle from './TableTabListTitle';

const { TabPane } = AntdTabs;

export default function TableTabList() {
  const list = useTableTabList() || [];
  const [[activeDb, activeTable] = [], openTab] = useActiveTable();

  const close = useCloseTable();
  const { isSidePanelOpen, setIsSidePanelOpen } =
    useContext(RawExplorerContext);

  const handleTabEdit = (
    tabKey: React.MouseEvent | React.KeyboardEvent | string,
    action: 'add' | 'remove'
  ) => {
    // because we pass `hideAdd: true` to `Tabs`, we will get events only for
    // the "remove" action
    if (action === 'remove' && typeof tabKey === 'string') {
      const [db, table] = tabKey.split('RAW_EXPLORER_TAB_PANE_KEY_SEPARATOR');
      if (db && table) {
        close([db, table]);
      }
    }
  };

  const handleActiveTabChange = (tabKey: string) => {
    const [db, table] = tabKey.split('RAW_EXPLORER_TAB_PANE_KEY_SEPARATOR');
    if (db && table) {
      openTab([db, table]);
    }
  };

  return (
    <StyledTabs
      getPopupContainer={getContainer}
      defaultActiveKey="2"
      type="editable-card"
      size="small"
      hideAdd={true}
      onEdit={handleTabEdit}
      onChange={handleActiveTabChange}
      activeKey={getTableTabKey(activeDb, activeTable)}
      tabBarExtraContent={{
        ...(isSidePanelOpen
          ? {}
          : {
              left: (
                <Button
                  aria-label="Show side panel"
                  size="small"
                  icon="PanelRight"
                  onClick={() => setIsSidePanelOpen(true)}
                  style={{ margin: '8px 8px 8px 0' }}
                />
              ),
            }),
      }}
    >
      {list.map(([db, table]) => (
        <TabPane
          closeIcon={<Button icon="Close" size="small" type="ghost" />}
          key={getTableTabKey(db, table)}
          tab={<TableTabListTitle db={db} table={table} />}
        />
      ))}
    </StyledTabs>
  );
}

const StyledTabs = styled(AntdTabs)`
  background: ${Colors['surface--strong']};

  .ant-tabs-tab-remove {
    padding: 0;
  }

  .ant-tabs-content {
    height: 100%;
  }

  .ant-tabs-nav {
    padding-left: 10px;
  }
`;
