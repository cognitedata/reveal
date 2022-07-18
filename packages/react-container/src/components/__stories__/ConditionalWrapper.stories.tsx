import React from 'react';

import {
  ConditionalWrapper,
  ConditionalWrapperWithProps,
} from '../ConditionalWrapper';

const Wrapper: React.FC = (children: any) => (
  <div>
    WRAPPER_ADDED
    {children}
  </div>
);

export const BaseWithoutWrapper = () => (
  <ConditionalWrapper wrap={Wrapper} condition={false}>
    <div>test-content 1</div>
  </ConditionalWrapper>
);

export const BaseWithWrapper = () => (
  <ConditionalWrapper wrap={Wrapper} condition>
    <div>test-content 2</div>
  </ConditionalWrapper>
);

const TestWrapper: React.FC<
  React.PropsWithChildren<{ otherProps: string }>
> = ({ children, otherProps }) => (
  <>
    <div>This is the test wrapper</div>
    <div>{otherProps}</div>
    <div>{children}</div>
  </>
);

export const WithPropsWithWrapper = () => (
  <ConditionalWrapperWithProps
    wrap={TestWrapper}
    condition
    otherProps="This string is from wrapper props"
  >
    <div>test-content 3</div>
  </ConditionalWrapperWithProps>
);

export default {
  title: 'Components/ConditionalWrapper',
};
