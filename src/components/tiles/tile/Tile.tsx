import React from 'react';
import { Detail, Overline, Tooltip } from '@cognite/cogs.js';
import SuiteAvatar from 'components/suiteAvatar';
import {
  TileHeader,
  TileContainer,
  TilePreview,
  TileDescription,
  StyledTitle,
} from 'components/tiles/elements';
import TilePreviewImage from 'components/tiles/tilePreviewImage/TilePreviewImage';
import { SuiteRowDelete } from 'store/suites/types';
import { TS_FIX_ME } from 'types/core';
import { useLastVisited } from 'hooks';
import { Flex } from 'styles/common';
import { renderIframe } from 'utils/iframe';

interface Props {
  avatar?: boolean;
  color?: string;
  dataItem: TS_FIX_ME;
  menu?: React.ReactElement;
  handleDelete?: (key: SuiteRowDelete[]) => void;
  handleEdit?: (key: SuiteRowDelete[]) => void;
  view?: 'suite' | 'board';
}

export const Tile: React.FC<Props> = ({
  avatar = false,
  color,
  dataItem,
  menu,
  view = 'suite',
}: Props) => {
  const isBoard = view === 'board';
  const { setAsLastvisited } = useLastVisited(dataItem);

  const renderPreview = (item: TS_FIX_ME) => {
    if (item.embedTag) {
      return renderIframe(item.embedTag);
    }
    if (item.imageFileId) {
      return <TilePreviewImage imageFileId={item.imageFileId} />;
    }
    return (
      <TilePreview>
        <Detail>{item.description}</Detail>
      </TilePreview>
    );
  };

  return (
    <>
      <TileContainer {...(isBoard && { onClick: setAsLastvisited })}>
        <TileHeader isBoard={isBoard} color={color}>
          <Flex>
            {avatar && (
              <SuiteAvatar title={dataItem.title} color={dataItem.color} />
            )}
            <TileDescription>
              <Overline level={3}>{dataItem?.type}</Overline>
              <Tooltip content={dataItem.title}>
                <StyledTitle level={6}>{dataItem.title}</StyledTitle>
              </Tooltip>
            </TileDescription>
          </Flex>
          {menu}
        </TileHeader>
        {renderPreview(dataItem)}
      </TileContainer>
    </>
  );
};
