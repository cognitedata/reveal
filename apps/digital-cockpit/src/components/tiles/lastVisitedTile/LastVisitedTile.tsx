import React from 'react';
import { Body, Graphic, Tooltip } from '@cognite/cogs.js';
import SuiteAvatar from 'components/suiteAvatar';
import {
  SmallTileContainer,
  TileDescription,
  StyledTitle,
} from 'components/tiles/elements';
import { dateToFromNowDaily } from 'utils/date';
import { Board } from 'store/suites/types';
import { useLastVisited } from 'hooks';
import { ApplicationItem } from 'store/config/types';
import { LastVisitedItem } from 'store/userSpace/types';

interface Props {
  dataItem: LastVisitedItem;
}

const LastVisitedTile: React.FC<Props> = ({ dataItem }: Props) => {
  const { setAsLastvisited } = useLastVisited(dataItem.key);
  let itemType: 'board' | 'application' | '' = '';
  if ((dataItem as Board).type) {
    itemType = 'board';
  } else if ((dataItem as ApplicationItem).url && dataItem.title) {
    itemType = 'application';
  }

  const renderIcon = () => {
    if (itemType === 'board') {
      return (
        <SuiteAvatar
          size="large"
          title={dataItem.title}
          logo={(dataItem as Board).type}
        />
      );
    }
    if (itemType === 'application') {
      return (
        <Graphic
          type={(dataItem as ApplicationItem).iconKey}
          style={{ width: '32px', height: '32px', margin: '10px 8px' }}
        />
      );
    }
    return null;
  };

  return (
    <SmallTileContainer onClick={setAsLastvisited}>
      {renderIcon()}
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

export default LastVisitedTile;
