import React from 'react';
import { Tooltip } from '@cognite/cogs.js';
import {
  SubSuiteTileContainer,
  TileDescription,
  StyledTitle,
} from 'components/tiles/elements';
import { CogniteExternalId } from '@cognite/sdk-core';
import { getSuiteByKey } from 'store/suites/selectors';
import { Suite } from 'store/suites/types';
import { useSelector } from 'react-redux';
import SuiteAvatar from 'components/suiteAvatar';
import { Link } from 'react-router-dom';

interface Props {
  suiteKey: CogniteExternalId;
  handleClick: () => void;
}

const SubSuiteTile: React.FC<Props> = ({ suiteKey, handleClick }: Props) => {
  const suite = useSelector(getSuiteByKey(suiteKey)) as Suite;

  return suite ? (
    <Link to={`/suites/${suiteKey}`} key={suiteKey} onClick={handleClick}>
      <SubSuiteTileContainer>
        <SuiteAvatar color={suite.color} title={suite.title} />
        <TileDescription>
          <Tooltip content={suite.title}>
            <StyledTitle level={6}>{suite.title}</StyledTitle>
          </Tooltip>
        </TileDescription>
      </SubSuiteTileContainer>
    </Link>
  ) : null;
};

export default SubSuiteTile;
