import React from 'react';
import { Graphic, Tooltip } from '@cognite/cogs.js';
import {
  SubSuiteTileContainer,
  TileDescription,
  StyledTitle,
} from 'components/tiles/elements';
import { CogniteExternalId } from '@cognite/sdk';
import { getSuiteByKey } from 'store/suites/selectors';
import { Suite } from 'store/suites/types';
import { useSelector } from 'react-redux';
import SuiteAvatar from 'components/suiteAvatar';
import { Link } from 'react-router-dom';

import TilePreviewImage from '../tilePreviewImage';

interface Props {
  suiteKey: CogniteExternalId;
  handleClick: () => void;
  menu?: React.ReactElement;
  size?: 'small' | 'medium';
}

const SubSuiteTile: React.FC<Props> = ({
  suiteKey,
  handleClick,
  menu,
  size = 'small',
}: Props) => {
  const suite = useSelector(getSuiteByKey(suiteKey)) as Suite;

  const renderThumbnail = () => {
    if (size === 'small') {
      return <SuiteAvatar color={suite.color} title={suite.title} />;
    }
    if (!suite.imageFileId) {
      return <Graphic type="Documents" style={{ height: 180, width: 180 }} />;
    }
    return <TilePreviewImage imageFileId={suite.imageFileId} />;
  };

  return suite ? (
    <Link to={`/suites/${suiteKey}`} key={suiteKey} onClick={handleClick}>
      <SubSuiteTileContainer className={`${size}-tile`}>
        <div className="flex-aligned-content">
          {renderThumbnail()}
          <TileDescription>
            <Tooltip content={suite.title}>
              <StyledTitle level={6}>{suite.title}</StyledTitle>
            </Tooltip>
          </TileDescription>
        </div>
        {menu}
      </SubSuiteTileContainer>
    </Link>
  ) : null;
};

export default SubSuiteTile;
