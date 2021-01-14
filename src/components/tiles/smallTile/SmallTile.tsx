import React from 'react';
import { Body, Tooltip } from '@cognite/cogs.js';
import SuiteAvatar from 'components/suiteAvatar';
import {
  SmallTileContainer,
  TileDescription,
  StyledTitle,
} from 'components/tiles/elements';
import { dateToFromNowDaily } from 'utils/date';
import { Board } from 'store/suites/types';
import { useLastVisited } from 'hooks';

interface Props {
  dataItem: Board;
}

export const SmallTile: React.FC<Props> = ({ dataItem }: Props) => {
  const { setAsLastvisited } = useLastVisited(dataItem);
  return (
    <SmallTileContainer onClick={setAsLastvisited}>
      <SuiteAvatar
        size="large"
        title={dataItem.title}
        color={dataItem.color}
        logo={dataItem.type}
      />
      <TileDescription>
        <Tooltip content={dataItem.title}>
          <StyledTitle level={6}>{dataItem.title}</StyledTitle>
        </Tooltip>
        <Body level={3}>
          {dataItem?.lastVisitedTime && (
            <>
              <span>Opened </span>
              {dateToFromNowDaily(dataItem?.lastVisitedTime)}
            </>
          )}
        </Body>
      </TileDescription>
    </SmallTileContainer>
  );
};
