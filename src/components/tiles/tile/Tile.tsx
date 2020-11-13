import React from 'react';
import { Button, Menu, Overline, Title } from '@cognite/cogs.js';
import SuiteAvatar from 'components/suiteAvatar';
import { useClickAwayListener } from 'hooks/useClickAwayListener';
import {
  ActionsContainer,
  TileHeader,
  TileContainer,
  TilePreview,
  TileDescription,
  TileOverline,
} from 'components/tiles/element';

interface Props {
  title: string;
  description?: string;
  color?: string;
  avatar?: boolean;
  view?: 'suite' | 'board';
}

export const Tile: React.FC<Props> = ({
  title,
  description,
  color,
  avatar = false,
  view = 'suite',
}: Props) => {
  const {
    ref,
    isComponentVisible,
    setIsComponentVisible,
  } = useClickAwayListener(false);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    setIsComponentVisible(() => !isComponentVisible);
  };
  const isBoard = view === 'board';
  return (
    <TileContainer>
      <TileHeader isBoard={isBoard}>
        {avatar && <SuiteAvatar title={title} color={color} />}
        <TileDescription>
          <TileOverline isBoard={isBoard}>
            <Overline level={3}>{description}</Overline>
          </TileOverline>
          <Title level={6}>{title}</Title>
        </TileDescription>
        <div ref={ref}>
          <Button
            variant="ghost"
            icon="MoreOverflowEllipsisHorizontal"
            onClick={handleMenuOpen}
          />
          <ActionsContainer>
            {isComponentVisible && (
              <Menu>
                <Menu.Item>Remove pin</Menu.Item>
                <Menu.Item>Edit suite</Menu.Item>
                <Menu.Item>Delete suite</Menu.Item>
                <Menu.Item>Manage access</Menu.Item>
                <Menu.Item>Content</Menu.Item>
              </Menu>
            )}
          </ActionsContainer>
        </div>
      </TileHeader>
      <TilePreview isBoard={isBoard} />
    </TileContainer>
  );
};
