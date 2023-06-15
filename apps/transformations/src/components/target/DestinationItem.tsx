import React from 'react';

import styled from 'styled-components';

import { Body } from '@cognite/cogs.js';

type DestinationItemProps = {
  children: React.ReactNode;
  description?: string;
  title: string;
};

const DestinationItem = ({
  children,
  title,
}: DestinationItemProps): JSX.Element => {
  return (
    <StyledDestinationContainer>
      <StyledDestinationItemHeader>
        <Body level={2} strong>
          {title}
        </Body>
      </StyledDestinationItemHeader>
      {children}
    </StyledDestinationContainer>
  );
};

const StyledDestinationContainer = styled.div`
  display: flex;
  flex-direction: column;

  :not(:last-child) {
    margin-bottom: 8px;
  }
`;

const StyledDestinationItemHeader = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: 4px;
`;

export default DestinationItem;
