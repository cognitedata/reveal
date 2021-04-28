import React, {
  FunctionComponent,
  HTMLAttributes,
  PropsWithChildren,
} from 'react';
import { GridH2Wrapper } from 'styles/StyledPage';

interface HeadingLabelProps extends HTMLAttributes<HTMLLabelElement> {
  labelFor: string;
}

export const HeadingLabel: FunctionComponent<HeadingLabelProps> = ({
  labelFor,
  children,
  ...rest
}: PropsWithChildren<HeadingLabelProps>) => {
  return (
    <GridH2Wrapper>
      <label htmlFor={labelFor} className="input-label" {...rest}>
        {children}
      </label>
    </GridH2Wrapper>
  );
};
