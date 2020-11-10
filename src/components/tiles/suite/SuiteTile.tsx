import React from 'react';
import { Body, Title } from '@cognite/cogs.js';
import SuiteAvatar from 'components/suiteAvatar';
import { SuiteTileContainer, TileDescription } from 'components/tiles/element';

interface Props {
  title: string;
  color: string;
}

export const SuiteTile: React.FC<Props> = ({ title, color }: Props) => {
  return (
    <SuiteTileContainer>
      <SuiteAvatar size="large" title={title} color={color} />
      <TileDescription>
        <Title level={6}>{title}</Title>
        <Body level={3}>description</Body>
      </TileDescription>
    </SuiteTileContainer>
  );
};
