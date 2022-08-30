import React, { FunctionComponent, PropsWithChildren } from 'react';
import { Colors, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import { StyledTitle2 } from 'components/styled';

export const ErrorBox: FunctionComponent<
  PropsWithChildren<{ heading: string }>
> = (props) => {
  return (
    <Wrapper className="z-1">
      <StyledErrorHeader>
        <Icon type="Warning" css="margin-right: 0.5rem" />
        {props.heading}
      </StyledErrorHeader>
      {props.children}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 2rem;

  grid-column: 1 / span 3;
  height: fit-content;
`;

const StyledErrorHeader = styled(StyledTitle2)`
  display: flex;
  align-items: center;

  &&& {
    color: ${Colors['yellow-1'].hex()};
  }
`;
