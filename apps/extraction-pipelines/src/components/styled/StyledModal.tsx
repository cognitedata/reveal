import React from 'react';
import { Colors, Title } from '@cognite/cogs.js';
import styled from 'styled-components';

export const StyledHeader = styled.header`
  display: flex;
  justify-content: space-between;
  .details-id {
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    margin-left: 1rem;

    span {
      margin-left: 0.3rem;
    }
  }
  button {
    background: ${Colors.white.hex()};
    color: ${Colors.black.hex()};
    border: none;
    &:hover {
      outline: none;
      box-shadow: none;
    }
  }
`;

export const StyledH2 = styled((props) => (
  <Title level={2} {...props}>
    {props.children}
  </Title>
))`
  font-size: 1.125rem;
  .details-name {
    margin-left: 1rem;
    font-size: 0.875rem;
  }
`;
