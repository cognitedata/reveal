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
import { Board, Suite } from 'store/suites/types';
import TilePreviewImage from 'components/tiles/tilePreviewImage';
import { useLastVisited } from 'hooks';
import { Flex } from 'styles/common';
import { renderIframe } from 'utils/iframe';

interface Props {
  avatar?: boolean;
  color?: string;
  dataItem: Board | Suite;
  menu?: React.ReactElement;
  view?: 'suite' | 'board';
}

export const Tile: React.FC<Props> = ({
  avatar = true,
  color,
  dataItem,
  menu,
  view = 'suite',
}: Props) => {
  const isBoard = view === 'board';
  const { setAsLastvisited } = useLastVisited(dataItem.key);

  const renderPreview = (item: Board | Suite) => {
    if ((item as Board).embedTag) {
      return renderIframe((item as Board).embedTag as string);
    }
    if ((item as Board).imageFileId) {
      return (
        <TilePreview>
          <TilePreviewImage imageFileId={(item as Board).imageFileId} />
        </TilePreview>
      );
    }
    return (
      <TilePreview>
        <Detail>{(item as Suite).description}</Detail>
      </TilePreview>
    );
  };

  return (
    <>
      <TileContainer
        isBoard={isBoard}
        {...(isBoard && { onClick: setAsLastvisited })}
      >
        <TileHeader isBoard={isBoard} color={color}>
          <Flex>
            {avatar && <SuiteAvatar title={dataItem.title} color={color} />}
            <TileDescription>
              <Overline level={3}>{(dataItem as Board)?.type}</Overline>
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
