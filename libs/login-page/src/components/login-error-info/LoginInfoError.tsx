import React, { useState } from 'react';

import styled from 'styled-components';

import { Body, Colors, Flex, Icon } from '@cognite/cogs.js';

type Props = {
  title: string;
  message: any;
  isExpand?: boolean;
};

export default function LoginInfoError({
  title,
  message,
  isExpand = true,
}: Props) {
  const [viewMoreState, setViewMoreState] = useState(false);

  const viewMoreHandler = () => {
    setViewMoreState(!viewMoreState);
  };

  return (
    <Container>
      <ActionTitle onClick={viewMoreHandler}>
        <InfoIcon type="WarningFilled" />
        <Title>{title}</Title>
        {isExpand && (
          <Icon type={viewMoreState ? 'ChevronUpSmall' : 'ChevronDownSmall'} />
        )}
      </ActionTitle>
      {viewMoreState && <InfoContent>{message}</InfoContent>}
    </Container>
  );
}

const ActionTitle = styled(Flex)`
  align-items: center;
  cursor: pointer;
`;

const Container = styled.div`
  background-color: ${Colors['surface--status-warning--muted--default']};
  border: 1px solid ${Colors['border--status-warning--muted']};
  border-radius: 8px;
  padding: 8px 15px;
  width: 100%;

  :not(:last-child) {
    margin-bottom: 6px;
  }
`;

const Title = styled.p`
  flex-grow: 1;
  font-weight: 500;
  margin: 0;
`;

const InfoContent = styled(Body).attrs({ level: 3 })`
  margin: 4px 0 0;
`;

const InfoIcon = styled(Icon)`
  margin-right: 8px;
  color: ${Colors['text-icon--status-warning']};
`;
