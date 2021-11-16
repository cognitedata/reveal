import { Button } from '@cognite/cogs.js';
import React, { FC } from 'react';
import styled from 'styled-components';

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
    <Content>
      <Button type="ghost" onClick={onBackClick}>
        {backText || 'Back'}
      </Button>
      <Button type="primary" onClick={onNextClick}>
        {nextText || 'Next'}
      </Button>
    </Content>
  );
};
