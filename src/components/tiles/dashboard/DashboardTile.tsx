import React from 'react';
import { Body, Button, Title } from '@cognite/cogs.js';
import SuiteAvatar from 'components/suiteAvatar';
import {
  DashboardTileHeader,
  DashboardTileContainer,
  DashboardTilePreview,
  TileDescription,
} from 'components/tiles/element';

interface Props {
  title: string;
  color: string;
}

export const DashboardTile: React.FC<Props> = ({ title, color }: Props) => {
  return (
    <DashboardTileContainer>
      <DashboardTileHeader>
        <SuiteAvatar title={title} color={color} />
        <TileDescription>
          <Title level={6}>{title}</Title>
          <Body level={3}>description</Body>
        </TileDescription>
        <Button variant="ghost" icon="MoreOverflowEllipsisHorizontal"></Button>
      </DashboardTileHeader>
      <DashboardTilePreview></DashboardTilePreview>
    </DashboardTileContainer>
  );
};
