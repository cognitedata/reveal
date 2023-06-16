import { useState } from 'react';

import { useTranslation } from '@transformations/common';
import {
  TransformationTab,
  useTransformationContext,
} from '@transformations/pages/transformation-details/TransformationContext';
import { Dropdown } from 'antd';

import { Flex, Icon, Menu } from '@cognite/cogs.js';

type TabPaneTitleProps = {
  tab: TransformationTab;
};

const TabPaneTitle = ({ tab }: TabPaneTitleProps): JSX.Element => {
  const { t } = useTranslation();

  const { removeTab, removeTabs, tabs } = useTransformationContext();

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const index = tabs.findIndex(({ key }) => key === tab.key);

  const handleCloseTab = (): void => {
    removeTab(tab.key);
    setIsDropdownVisible(false);
  };

  const handleCloseOthers = (): void => {
    removeTabs(tabs.filter(({ key }) => key !== tab.key).map(({ key }) => key));
    setIsDropdownVisible(false);
  };

  const handleCloseToTheLeft = (): void => {
    removeTabs(tabs.slice(0, index).map(({ key }) => key));
    setIsDropdownVisible(false);
  };

  const handleCloseToTheRight = (): void => {
    removeTabs(tabs.slice(index + 1).map(({ key }) => key));
    setIsDropdownVisible(false);
  };

  const handleCloseAll = (): void => {
    removeTabs(tabs.map(({ key }) => key));
    setIsDropdownVisible(false);
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
            disabled={index === tabs.length - 1}
            onClick={handleCloseToTheRight}
          >
            {t('close-to-the-right')}
          </Menu.Item>
          <Menu.Item onClick={handleCloseAll}>{t('close-all')}</Menu.Item>
        </Menu>
      }
      trigger={['contextMenu']}
      onOpenChange={handleVisibleChange}
      open={isDropdownVisible}
    >
      <Flex gap={6} alignItems="center">
        {!tab.icon || typeof tab.icon === 'string' ? (
          <Icon type={tab.icon ?? 'DocumentSearch'} />
        ) : (
          tab.icon
        )}
        {tab.title}
      </Flex>
    </Dropdown>
  );
};

export default TabPaneTitle;
