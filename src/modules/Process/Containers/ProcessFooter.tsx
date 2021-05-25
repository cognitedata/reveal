import React from 'react';
import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';

export const ProcessFooter = () => {
  return (
    <FooterContainer>
      <Button> Finish session without processing</Button>
    </FooterContainer>
  );
};

const FooterContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 50px;
  padding: 0 20px;
`;
