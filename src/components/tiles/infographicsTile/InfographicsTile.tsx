import React from 'react';
import { Overline, Tooltip } from '@cognite/cogs.js';
import { Flex } from 'styles/common';
import { Board } from 'store/suites/types';
import { renderIframe } from 'utils/iframe';
import {
  TileHeader,
  TileDescription,
  LargeTileContainer,
  LargeTilePreview,
  StyledTitle,
} from '../elements';

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
  return (
    <LargeTileContainer>
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
      <LargeTilePreview>
        {dataItem.embedTag &&
          renderIframe(dataItem.embedTag, TilePreviewHeight, TilePreviewWidth)}
      </LargeTilePreview>
    </LargeTileContainer>
  );
};
