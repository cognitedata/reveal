import React from 'react';
import { useParams } from 'react-router-dom';
import { Button, Title } from '@cognite/cogs.js';
import SuiteAvatar from 'components/suiteAvatar';
import Suitebar from 'components/suitebar';
import { Tile } from 'components/tiles';
import { TilesContainer, OverviewContainer } from 'styles/common';
import { StyledTitle } from './elements';

const SuiteOverview: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const Items = [
    {
      id: '1',
      boardType: 'Grafana Dashboard',
      title: 'Critical system health',
    },
    {
      id: '2',
      boardType: 'PowerBI Dashboard',
      title: 'Inspection dashboard',
    },
    {
      id: '3',
      boardType: 'Grafana Dashboard',
      title: 'Critical system health',
    },
    {
      id: '4',
      boardType: 'Grafana Dashboard',
      title: 'Critical system health',
    },
    {
      id: '5',
      boardType: 'PowerBI Dashboard',
      title: 'Inspection dashboard',
    },
    {
      id: '6',
      boardType: 'Grafana Dashboard',
      title: 'Critical system health',
    },
  ];

  const Header = () => {
    return (
      <>
        <SuiteAvatar color="#C8F4E7" title="Product Optimization" />
        <Title as={StyledTitle} level={5}>
          Product Optimization
        </Title>
        <Button variant="ghost" icon="MoreOverflowEllipsisHorizontal" />
      </>
    );
  };
  return (
    <>
      <Suitebar
        buttonText="Add dashboard"
        leftCustomHeader={<Header />}
        backNavigation
      />
      <OverviewContainer>
        <TilesContainer>
          <Title level={6}>All dashboards</Title>
          {Items.map((item) => {
            return (
              <Tile
                key={item.id}
                view="board"
                title={item.title}
                description={item.boardType}
              />
            );
          })}
        </TilesContainer>
        <div>I am inside suite {id}</div>
      </OverviewContainer>
    </>
  );
};

export default SuiteOverview;
