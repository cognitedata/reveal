/*!
 * Copyright 2024 Cognite AS
 */

import { useMemo, type ReactElement } from 'react';
import styled from 'styled-components';

import { CategoryFilterCommand } from '../../architecture/base/concreteCommands/CategoryFilterCommand';
import { createButton } from './CommandButtons';
import { effect } from '@cognite/signals';

export const FilterContainer = (): ReactElement => {
  const command = useMemo(() => new CategoryFilterCommand(), []);
  const button = createButton(command, 'right');

  effect(() => {
    command.category();
    confirm('Category has changed to: ' + command.category());
  });

  return (
    <Container
      style={{
        left: 100,
        top: 100,
        padding: 10
      }}>
      {button}
    </Container>
  );
};

const Container = styled.div`
  z-index: 1000;
  position: absolute;
  display: block;
  border-radius: 6px;
  overflow-x: auto;
  overflow-y: auto;
  background-color: white;
  box-shadow: 0px 1px 8px #4f52681a;
`;
