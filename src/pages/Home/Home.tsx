import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Title } from '@cognite/cogs.js';
import Suitebar from 'components/suitebar/Suitebar';
import { SmallTile, Tile } from 'components/tiles';
import { colors } from 'contants/suiteColors';
import { TilesContainer, OverviewContainer } from 'styles/common';
import { SmallTilesContainer } from './elements';

const Home = () => {
  const { t } = useTranslation('Home');

  // Temporary sample
  const Items = [
    {
      id: '-ML7mCrzPkT1OA-a9IZa',
      title: t('Inspections') as string,
      color: colors[Math.floor(Math.random() * colors.length)],
    },
    {
      id: '-ML7mCrzPkT1OA-a9IZb',
      title: t('Maintenance Planner') as string,
      color: colors[Math.floor(Math.random() * colors.length)],
    },
    {
      id: '-ML7mCrzPkT1OA-a9IZc',
      title: t('Product Optimization') as string,
      color: colors[Math.floor(Math.random() * colors.length)],
    },
    {
      id: '-ML7mCrzPkT1OA-a9IZd',
      title: t('Asset Data Insight') as string,
      color: colors[Math.floor(Math.random() * colors.length)],
    },
    {
      id: '-ML7mCrzPkT1OA-a9IZe',
      title: t('Subsurface') as string,
      color: colors[Math.floor(Math.random() * colors.length)],
    },
    {
      id: '-ML7mCrzPkT1OA-a9IZf',
      title: t('Operations') as string,
      color: colors[Math.floor(Math.random() * colors.length)],
    },
    {
      id: '-ML7mCrzPkT1OA-a9IZg',
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
            return (
              <Link to={`/suites/${item.id}`} key={item.id}>
                <SmallTile title={item.title} color={item.color} />
              </Link>
            );
          })}
        </SmallTilesContainer>
        <TilesContainer>
          <Title level={6}>Pinned</Title>
          {Items.map((item) => {
            return (
              <Link to={`/suites/${item.id}`} key={item.id}>
                <Tile title={item.title} color={item.color} avatar />
              </Link>
            );
          })}
        </TilesContainer>
        <TilesContainer>
          <Title level={6}>All suites</Title>
          {Items.map((item) => {
            return (
              <Link to={`/suites/${item.id}`} key={item.id}>
                <Tile title={item.title} color={item.color} avatar />
              </Link>
            );
          })}
        </TilesContainer>
      </OverviewContainer>
    </>
  );
};

export default Home;
