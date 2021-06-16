import React from 'react';
import { Title } from '@cognite/cogs.js';
import { SuitbarContainer, MainContent } from './elements';

interface Props {
  leftCustomHeader?: React.ReactNode;
  headerText?: string;
  actionsPanel?: React.ReactNode;
}

const Suitebar: React.FC<Props> = ({
  leftCustomHeader,
  headerText,
  actionsPanel,
}: Props) => (
  <SuitbarContainer>
    <MainContent>
      {leftCustomHeader}
      {!leftCustomHeader && <Title level={5}>{headerText}</Title>}
      <div>{actionsPanel}</div>
    </MainContent>
  </SuitbarContainer>
);

export default Suitebar;
