import React from 'react';
import { useTranslation } from 'react-i18next';
import { Title } from '@cognite/cogs.js';
import Suitebar from 'components/suitebar/Suitebar';
import { SuiteTile, DashboardTile } from 'components/tiles';
import { colors } from 'contants/suiteColors';
import {
  OverviewContainer,
  AllDashboardsContainer,
  PinnedContainer,
  QuickAccessContainer,
} from './elements';

const Home = () => {
  const { t } = useTranslation('Home');

  // Temporary sample
  const QuiteAccessSuites = [
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

  return (
    <>
      <Suitebar />
      <OverviewContainer>
        <QuickAccessContainer>
          <Title level={6}>Quick Access</Title>

          {QuiteAccessSuites.map((item) => {
            return <SuiteTile title={item.title} color={item.color} />;
          })}
        </QuickAccessContainer>
        <PinnedContainer>
          <Title level={6}>Pinned</Title>
          {QuiteAccessSuites.map((item) => {
            return <DashboardTile title={item.title} color={item.color} />;
          })}
        </PinnedContainer>
        <AllDashboardsContainer></AllDashboardsContainer>
      </OverviewContainer>
    </>
  );
};

export default Home;
