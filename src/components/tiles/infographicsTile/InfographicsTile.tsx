import React from 'react';
import { Overline, Tooltip } from '@cognite/cogs.js';
import { Flex } from 'styles/common';
import { Board } from 'store/suites/types';
import { renderIframe } from 'utils/iframe';
import { useLastVisited } from 'hooks';
import {
  TileHeader,
  TileDescription,
  LargeTileContainer,
  LargeTilePreview,
  StyledTitle,
} from '../elements';
import TilePreviewImage from '../tilePreviewImage';

const TilePreviewHeight = '576';
const TilePreviewWidth = '952';

interface Props {
  color?: string;
  dataItem: Board;
  menu?: React.ReactElement;
}

export const InfographicsTile: React.FC<Props> = ({
  color,
  dataItem,
  menu,
}: Props) => {
  const { setAsLastvisited } = useLastVisited(dataItem);
  const renderTile = (item: Board) => {
    if (item.embedTag) {
      return renderIframe(item.embedTag, TilePreviewHeight, TilePreviewWidth);
    }
    if (item.imageFileId) {
      return <TilePreviewImage imageFileId={item.imageFileId} />;
    }
    return null;
  };

  return (
    <LargeTileContainer onClick={setAsLastvisited}>
      <TileHeader color={color} isBoard>
        <Flex>
          <TileDescription>
            <Overline level={3}>{dataItem.type}</Overline>
            <Tooltip content={dataItem.title}>
              <StyledTitle level={6}>{dataItem.title}</StyledTitle>
            </Tooltip>
          </TileDescription>
        </Flex>
        {menu}
      </TileHeader>
      <LargeTilePreview>{renderTile(dataItem)}</LargeTilePreview>
    </LargeTileContainer>
  );
};
