import { Button } from '@cognite/cogs.js';
import React, { FC } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: fixed;
  bottom: 0px;
  width: 100%;
  height: 4rem;
  border-top: 1px solid var(--cogs-greyscale-grey4);
  padding: 14px 32px;
  background-color: white;
`;

const Content = styled.div`
  display: flex;
  justify-content: space-between;
`;

interface Props {
  nextText?: string;
  backText?: string;
  onBackClick: () => void;
  onNextClick: () => void;
}
export const BottomNavigation: FC<Props> = ({
  nextText,
  backText,
  onBackClick,
  onNextClick,
}) => {
  return (
    <Container>
      <Content>
        <Button type="ghost" onClick={onBackClick}>
          {backText || 'Back'}
        </Button>
        <Button type="primary" onClick={onNextClick}>
          {nextText || 'Next'}
        </Button>
      </Content>
    </Container>
  );
};
