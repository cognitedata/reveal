import React from 'react';
import { Body, Tooltip } from '@cognite/cogs.js';
import SuiteAvatar from 'components/suiteAvatar';
import {
  SmallTileContainer,
  TileDescription,
  StyledTitle,
} from 'components/tiles/element';

interface Props {
  title: string;
  color: string;
}

export const SmallTile: React.FC<Props> = ({ title, color }: Props) => {
  return (
    <SmallTileContainer>
      <SuiteAvatar size="large" title={title} color={color} />
      <TileDescription>
        <Tooltip content={title}>
          <StyledTitle level={6}>{title}</StyledTitle>
        </Tooltip>
        <Body level={3}>description</Body>
      </TileDescription>
    </SmallTileContainer>
  );
};
