import React, { useState } from 'react';
import { Overline, Title } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import SuiteAvatar from 'components/suiteAvatar';
import { DeleteModal, MultiStepModal } from 'components/modals';
import MeatballsMenu from 'components/menus';
import {
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
  linkTo: string;
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
  linkTo,
}: Props) => {
  const [activeModal, setActiveModal] = useState<string>('');
  const history = useHistory();

  const closeModal = () => {
    setActiveModal('');
  };

  const goToSuite = () => {
    history.push(linkTo);
  };

  const goToBoard = () => {
    window.open(linkTo, '_blank');
  };

  const isBoard = view === 'board';
  return (
    <>
      <TileContainer {...(isBoard && { onClick: goToBoard })}>
        <TileHeader isBoard={isBoard} color={color}>
          {avatar && (
            <SuiteAvatar title={dataItem.title} color={dataItem.color} />
          )}
          <TileDescription>
            <TileOverline isBoard={isBoard}>
              <Overline level={3}>{dataItem?.type}</Overline>
            </TileOverline>
            <Title level={6}>{dataItem.title}</Title>
          </TileDescription>
          <MeatballsMenu openModal={setActiveModal} />
        </TileHeader>
        <TilePreview
          isBoard={isBoard}
          {...(!isBoard && { onClick: goToSuite })}
        >
          {dataItem.embedTag && renderIframe(dataItem.embedTag)}
        </TilePreview>
        {activeModal === 'delete' && (
          <DeleteModal handleCloseModal={closeModal} dataItem={dataItem} />
        )}
        {activeModal === 'edit' && (
          <MultiStepModal
            handleCloseModal={closeModal}
            mode="edit"
            dataItem={dataItem}
          />
        )}
      </TileContainer>
    </>
  );
};
