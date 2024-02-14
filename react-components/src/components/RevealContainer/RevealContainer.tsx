/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement } from 'react';
import { RevealContext, type RevealContextProps } from '../RevealContext/RevealContext';
import { RevealCanvas } from '../..';

export function RevealContainer({ children, ...rest }: RevealContextProps): ReactElement {
  return (
    <RevealContext {...rest}>
      <RevealCanvas>{children}</RevealCanvas>
    </RevealContext>
  );
}
