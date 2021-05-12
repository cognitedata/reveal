import React from 'react';
import styled from 'styled-components';
import { Title, Colors } from '@cognite/cogs.js';

const StyledTitle = styled(Title)`
  margin-bottom: 16px;
  border-bottom: 1px solid ${Colors['greyscale-grey4'].hex()};
`;
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${Colors['greyscale-grey4'].hex()};
  box-sizing: border-box;
  border-radius: 8px;
  padding: 0;
  margin: 0;

  & > * {
    padding: 0 16px;
  }
  &:first-child > :first-child {
    padding: 16px 16px 0 16px;
  }
  &:last-child > :last-child {
    padding: 0 16px 16px 16px;
  }
`;

type Props = {
  children: React.ReactNode;
  title?: string;
};
export const TitledSection = (props: Props): JSX.Element => {
  const { title, children } = props;
  return (
    <Wrapper>
      {title && (
        <StyledTitle level={5} style={{ paddingBottom: '16px' }}>
          {title}
        </StyledTitle>
      )}
      {children}
    </Wrapper>
  );
};
