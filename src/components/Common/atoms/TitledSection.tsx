import React from 'react';
import styled from 'styled-components';
import { Title, Colors } from '@cognite/cogs.js';

const StyledTitle = styled(Title)`
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
`;

type Props = {
  title: React.ReactNode;
  children: React.ReactNode;
  useCustomPadding?: boolean;
};
export const TitledSection = (props: Props): JSX.Element => {
  const { title, children, useCustomPadding = false } = props;
  const style: React.CSSProperties = {};
  if (!useCustomPadding) style.padding = '16px';

  return (
    <Wrapper>
      <StyledTitle level={5} style={style}>
        {title}
      </StyledTitle>
      {children}
    </Wrapper>
  );
};
