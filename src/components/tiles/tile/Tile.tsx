import React, { useState } from 'react';
import { Button, Menu, Overline, Title } from '@cognite/cogs.js';
import SuiteAvatar from 'components/suiteAvatar';
import { useClickAwayListener } from 'hooks/useClickAwayListener';
import { DeleteModal } from 'components/modals';
import {
  ActionsContainer,
  TileHeader,
  TileContainer,
  TilePreview,
  TileDescription,
  TileOverline,
} from 'components/tiles/element';
import { SuiteRowDelete } from 'store/suites/types';

const TilePreviewHeight = '184';
const TilePreviewWidth = '300';

interface Props {
  avatar?: boolean;
  color?: string;
  dataItem: any;
  handleDelete?: (key: SuiteRowDelete[]) => void;
  handleEdit?: (key: SuiteRowDelete[]) => void;
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
  avatar = false,
  color,
  dataItem,
  view = 'suite',
}: Props) => {
  const [isOpenModal, setOpenModal] = useState(false);

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

  const openDeleteModal = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    setOpenModal(true);
  };

  const isBoard = view === 'board';
  return (
    <>
      <TileContainer>
        <TileHeader isBoard={isBoard} color={color}>
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
                  <Menu.Item>
                    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
                    <div role="button" tabIndex={0} onClick={openDeleteModal}>
                      Delete suite
                    </div>
                  </Menu.Item>
                  <Menu.Item>Manage access</Menu.Item>
                  <Menu.Item>Share</Menu.Item>
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
        {isOpenModal && <DeleteModal dataItem={dataItem} />}
      </TileContainer>
    </>
  );
};
