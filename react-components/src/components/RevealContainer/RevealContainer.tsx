import { type ReactElement } from 'react';
import { RevealContext, type RevealContextProps } from '../RevealContext/RevealContext';
import { RevealCanvas } from '../RevealCanvas';

export function RevealContainer({ children, ...rest }: RevealContextProps): ReactElement {
  return (
    <RevealContext {...rest}>
      <RevealCanvas>{children}</RevealCanvas>
    </RevealContext>
  );
}
