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

const TilePreviewHeight = '184';
const TilePreviewWidth = '300';

// create dataItem interface
interface Props {
  dataItem: any;
  avatar?: boolean;
  view?: 'suite' | 'board';
}
// eslint-disable-next-line
// TODO manipulate DOM to change iframe width & height
const adjustIframeTagSize = (tag: string = ''): string =>
  tag
    .replace(/(height=["|']?)(\d*)/, `$1${TilePreviewHeight}`)
    .replace(/(width=["|']?)(\d*)/, `$1${TilePreviewWidth}`);

const renderIframe = (tag: string): JSX.Element | null => {
  if (!tag) {
    return null;
  }
  const elem = (
    // eslint-disable-next-line react/no-danger
    <div dangerouslySetInnerHTML={{ __html: adjustIframeTagSize(tag) }} />
  );
  return elem;
};

export const Tile: React.FC<Props> = ({
  dataItem,
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
        {avatar && (
          <SuiteAvatar title={dataItem.title} color={dataItem.color} />
        )}
        <TileDescription>
          <TileOverline isBoard={isBoard}>
            <Overline level={3}>{dataItem.type}</Overline>
          </TileOverline>
          <Title level={6}>{dataItem.title}</Title>
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
      {dataItem.embedTag ? (
        renderIframe(dataItem.embedTag)
      ) : (
        <TilePreview isBoard={isBoard} />
      )}
    </TileContainer>
  );
};
