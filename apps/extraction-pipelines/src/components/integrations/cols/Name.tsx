import React, { FunctionComponent } from 'react';
import { Button, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

const StyledButton = styled((props) => (
  <Button {...props}>{props.children}</Button>
))`
  text-align: left;
  font-weight: normal;
  padding: 0;
  &.cogs-btn-secondary {
    &.cogs-btn-ghost {
      width: 10rem;
      display: flex;
      justify-content: flex-start;
      background-color: inherit;
      &:hover {
        background-color: ${Colors['greyscale-grey2'].hex()};
      }
      &:focus {
        background-color: ${Colors.white.hex()};
      }
    }
  }
`;

interface OwnProps {
  name: string;
  selected: boolean;
  controls: string;
}

type Props = OwnProps;

const Name: FunctionComponent<Props> = ({
  name,
  selected,
  controls,
}: Props) => {
  return (
    <StyledButton
      variant="ghost"
      role="tab"
      aria-selected={selected}
      aria-controls={controls}
    >
      {name}
    </StyledButton>
  );
};

export default Name;
