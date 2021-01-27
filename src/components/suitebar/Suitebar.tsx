import React from 'react';
import { Title } from '@cognite/cogs.js';
import { SuitbarContainer, MainContent } from './elements';

interface Props {
  leftCustomHeader?: React.ReactNode;
  headerText?: string;
  actionButton?: React.ReactNode;
}

const Suitebar: React.FC<Props> = ({
  leftCustomHeader,
  headerText,
  actionButton,
}: Props) => (
  <SuitbarContainer>
    <MainContent>
      {leftCustomHeader}
      {!leftCustomHeader && <Title level={5}>{headerText}</Title>}
      <div>{actionButton}</div>
    </MainContent>
  </SuitbarContainer>
);

export default Suitebar;
