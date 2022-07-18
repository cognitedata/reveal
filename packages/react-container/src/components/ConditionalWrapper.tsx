import React from 'react';

interface ConditionalWrapperProps {
  condition?: boolean;
  wrap: React.FC<React.ReactElement>;
  children: React.ReactElement;
  [otherProps: string]: unknown;
}
export const ConditionalWrapper: React.FC<ConditionalWrapperProps> = ({
  condition,
  wrap,
  children,
}) => (condition ? wrap(children) : children);

// wrap is less type safe until we fix the 'any'
// so made this version a separate one
interface ConditionalWrapperWithPropsProps {
  condition?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wrap: React.FC<any>;
  children: React.ReactElement;
  [otherProps: string]: unknown;
}
export const ConditionalWrapperWithProps: React.FC<
  ConditionalWrapperWithPropsProps
> = ({ condition, wrap, children, ...rest }) =>
  condition ? wrap({ children, ...rest }) : children;
