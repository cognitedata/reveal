import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Overline } from '@cognite/cogs.js';
import { colors } from 'contants/suiteColors';
import NavigationItem from './NavigationItem';
import {
  ActionContainer,
  AvailableSuitesContainer,
  SidebarContainer,
  UnAvailableSuitesContainer,
} from './elements';

interface NavigationItem {
  title: string;
  color: string;
}

interface Props {
  isOpen: boolean;
}

const renderNavigationItem = (item: NavigationItem, disabled?: boolean) => {
  return (
    <NavigationItem
      title={item.title}
      key={item.title}
      color={item.color}
      data-testid={`NavigationItem-${item.title}`}
      disabled={disabled}
    />
  );
};

const LeftSidebar: React.FC<Props> = ({ isOpen }: Props) => {
  const { t } = useTranslation('Home');

  // Temporary sample
  const TopNavigation = [
    {
      title: t('Inspections') as string,
      color: colors[Math.floor(Math.random() * colors.length)],
    },
    {
      title: t('Maintenance Planner') as string,
      color: colors[Math.floor(Math.random() * colors.length)],
    },
    {
      title: t('Product Optimization') as string,
      color: colors[Math.floor(Math.random() * colors.length)],
    },
    {
      title: t('Asset Data Insight') as string,
      color: colors[Math.floor(Math.random() * colors.length)],
    },
    {
      title: t('Subsurface') as string,
      color: colors[Math.floor(Math.random() * colors.length)],
    },
    {
      title: t('Operations') as string,
      color: colors[Math.floor(Math.random() * colors.length)],
    },
    {
      title: t('HSE & ERM') as string,
      color: colors[Math.floor(Math.random() * colors.length)],
    },
  ];
  const BottomNavigation = [
    {
      title: t('Inspections') as string,
      color: colors[Math.floor(Math.random() * colors.length)],
    },
    {
      title: t('Maintenance Planner') as string,
      color: colors[Math.floor(Math.random() * colors.length)],
    },
    {
      title: t('Product Optimization') as string,
      color: colors[Math.floor(Math.random() * colors.length)],
    },
  ];
  return (
    <>
      <SidebarContainer open={isOpen}>
        <Input
          variant="noBorder"
          placeholder="Search for suites"
          icon="Search"
          iconPlacement="left"
          fullWidth
        />
        <ActionContainer>
          <Overline level={2}>All Suites</Overline>
          <Button
            type="secondary"
            variant="ghost"
            icon="Plus"
            iconPlacement="left"
          >
            {t('New')}
          </Button>
        </ActionContainer>
        <AvailableSuitesContainer>
          {TopNavigation.map((item) => renderNavigationItem(item))}
        </AvailableSuitesContainer>
        <UnAvailableSuitesContainer>
          {BottomNavigation.map((item) => renderNavigationItem(item, true))}
        </UnAvailableSuitesContainer>
      </SidebarContainer>
    </>
  );
};

export default LeftSidebar;
