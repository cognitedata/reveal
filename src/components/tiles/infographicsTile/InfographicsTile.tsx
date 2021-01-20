import React from 'react';
import { Overline, Tooltip } from '@cognite/cogs.js';
import { Flex } from 'styles/common';
import { Board } from 'store/suites/types';
import {
  TileHeader,
  TileDescription,
  LargeTileContainer,
  LargeTilePreview,
  StyledTitle,
} from '../elements';

const TilePreviewHeight = '576';
const TilePreviewWidth = '952';

// Move to utils
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
        {dataItem.embedTag && renderIframe(dataItem.embedTag)}
      </LargeTilePreview>
    </LargeTileContainer>
  );
};
