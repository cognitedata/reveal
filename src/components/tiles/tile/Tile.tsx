import React, { useState } from 'react';
import { Button, Menu, Overline, Title } from '@cognite/cogs.js';
import SuiteAvatar from 'components/suiteAvatar';
import {
  ActionsContainer,
  TileHeader,
  TileContainer,
  TilePreview,
  TileDescription,
} from 'components/tiles/element';

interface Props {
  title: string;
  color: string;
}

export const Tile: React.FC<Props> = ({ title, color }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleMenuOpen = () => {
    setIsOpen(() => !isOpen);
  };

  return (
    <TileContainer>
      <TileHeader>
        <SuiteAvatar title={title} color={color} />
        <TileDescription>
          <Overline level={3}>Grafana dashboard</Overline>
          <Title level={6}>{title}</Title>
        </TileDescription>
        <Button
          variant="ghost"
          icon="MoreOverflowEllipsisHorizontal"
          onClick={handleMenuOpen}
        />
      </TileHeader>
      <ActionsContainer>
        {isOpen && (
          <Menu>
            <Menu.Item>Remove pin</Menu.Item>
            <Menu.Item>Edit suite</Menu.Item>
            <Menu.Item>Delete suite</Menu.Item>
            <Menu.Item>Manage access</Menu.Item>
            <Menu.Item>Content</Menu.Item>
          </Menu>
        )}
      </ActionsContainer>
      <TilePreview />
    </TileContainer>
  );
};
