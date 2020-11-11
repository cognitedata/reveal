import React from 'react';
import { useTranslation } from 'react-i18next';
import { Title } from '@cognite/cogs.js';
import Suitebar from 'components/suitebar/Suitebar';
import { SmallTile, Tile } from 'components/tiles';
import { colors } from 'contants/suiteColors';
import {
  OverviewContainer,
  SmallTilesContainer,
  TilesContainer,
} from './elements';

const Home = () => {
  const { t } = useTranslation('Home');

  // Temporary sample
  const Items = [
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
      <Suitebar buttonText="New suite" />
      <OverviewContainer>
        <SmallTilesContainer>
          <Title level={6}>Quick Access</Title>

          {Items.map((item) => {
            return <SmallTile title={item.title} color={item.color} />;
          })}
        </SmallTilesContainer>
        <TilesContainer>
          <Title level={6}>Pinned</Title>
          {Items.map((item) => {
            return <Tile title={item.title} color={item.color} />;
          })}
        </TilesContainer>
        <TilesContainer>
          <Title level={6}>All suites</Title>
          {Items.map((item) => {
            return <Tile title={item.title} color={item.color} />;
          })}
        </TilesContainer>
      </OverviewContainer>
    </>
  );
};

export default Home;
