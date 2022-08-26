import { Colors, Flex, Icon, Menu } from '@cognite/cogs.js';
import { Dropdown } from 'antd';
import { useTranslation } from 'common/i18n';
import {
  useActiveTable,
  useCloseTable,
  useCloseTables,
  useTableTabList,
} from 'hooks/table-tabs';

import { useState } from 'react';

type TableTabListTitleProps = {
  db: string;
  table: string;
};

const TableTabListTitle = ({
  db,
  table,
}: TableTabListTitleProps): JSX.Element => {
  const { t } = useTranslation();

  const list = useTableTabList() || [];
  const [[activeDb, activeTable] = []] = useActiveTable();

  const close = useCloseTable();
  const closeTables = useCloseTables();

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const index = list.findIndex(
    ([testDb, testTable]) => testDb === db && testTable === table
  );

  const handleClick: React.MouseEventHandler<HTMLElement> = (e): void => {
    e.stopPropagation();
    setIsDropdownVisible(false);
  };

  const handleCloseTab: React.MouseEventHandler<HTMLElement> = (e): void => {
    close([db, table]);
    handleClick(e);
  };

  const handleCloseOthers: React.MouseEventHandler<HTMLElement> = (e): void => {
    closeTables(
      list.filter(([testDb, testTable]) => db !== testDb || table !== testTable)
    );
    handleClick(e);
  };

  const handleCloseToTheLeft: React.MouseEventHandler<HTMLElement> = (
    e
  ): void => {
    closeTables(list.slice(0, index));
    handleClick(e);
  };

  const handleCloseToTheRight: React.MouseEventHandler<HTMLElement> = (
    e
  ): void => {
    closeTables(list.slice(index + 1));
    handleClick(e);
  };

  const handleCloseAll: React.MouseEventHandler<HTMLElement> = (e): void => {
    closeTables(list);
    handleClick(e);
  };

  const handleVisibleChange = (visible: boolean): void => {
    setIsDropdownVisible(visible);
  };

  return (
    <Dropdown
      overlay={
        <Menu>
          <Menu.Item onClick={handleCloseTab}>{t('close-tab')}</Menu.Item>
          <Menu.Item onClick={handleCloseOthers}>{t('close-others')}</Menu.Item>
          <Menu.Item disabled={index === 0} onClick={handleCloseToTheLeft}>
            {t('close-to-the-left')}
          </Menu.Item>
          <Menu.Item
            disabled={index === list.length - 1}
            onClick={handleCloseToTheRight}
          >
            {t('close-to-the-right')}
          </Menu.Item>
          <Menu.Item onClick={handleCloseAll}>{t('close-all')}</Menu.Item>
        </Menu>
      }
      trigger={['contextMenu']}
      onVisibleChange={handleVisibleChange}
      visible={isDropdownVisible}
    >
      <Flex alignItems="center" gap={6}>
        <Icon
          type="DataTable"
          style={{
            ...(activeDb === db && activeTable === table
              ? { color: Colors['text-icon--status-success'] }
              : {}),
          }}
        />
        {table}
      </Flex>
    </Dropdown>
  );
};

export default TableTabListTitle;
