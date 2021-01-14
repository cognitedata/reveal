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
import { SuiteRowDelete } from 'store/suites/types';
import { TS_FIX_ME } from 'types/core';
import { useLastVisited } from 'hooks';
import { Flex } from 'styles/common';

const TilePreviewHeight = '184';
const TilePreviewWidth = '298';

interface Props {
  avatar?: boolean;
  color?: string;
  dataItem: TS_FIX_ME;
  menu?: React.ReactElement;
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
  menu,
  view = 'suite',
}: Props) => {
  const isBoard = view === 'board';
  const { setAsLastvisited } = useLastVisited(dataItem);

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
        {dataItem.embedTag ? (
          renderIframe(dataItem.embedTag)
        ) : (
          <TilePreview>
            <Detail>{dataItem.description}</Detail>
          </TilePreview>
        )}
      </TileContainer>
    </>
  );
};
