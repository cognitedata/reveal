import { Body } from '@cognite/cogs.js';
import styled from 'styled-components';
import React from 'react';

export const PopupUIElementContainer = ({
  title,
  children,
}: {
  title: string;
  children: any;
}) => {
  return (
    <Container>
      <div style={{ paddingBottom: '5px' }}>
        <Body level={2} strong>
          {title}
        </Body>
      </div>
      <div style={{ width: '100%' }}>{children}</div>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;
