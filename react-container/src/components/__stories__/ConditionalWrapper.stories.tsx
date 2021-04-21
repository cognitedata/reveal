import React from 'react';

import {
  ConditionalWrapper,
  ConditionalWrapperWithProps,
} from '../ConditionalWrapper';

const Wrapper: React.FC = (children) => {
  return (
    <div>
      WRAPPER_ADDED
      {children}
    </div>
  );
};

export const BaseWithoutWrapper = () => {
  return (
    <ConditionalWrapper wrap={Wrapper} condition={false}>
      <div>test-content 1</div>
    </ConditionalWrapper>
  );
};

export const BaseWithWrapper = () => {
  return (
    <ConditionalWrapper wrap={Wrapper} condition>
      <div>test-content 2</div>
    </ConditionalWrapper>
  );
};

const TestWrapper: React.FC<{ otherProps: string }> = ({
  children,
  otherProps,
}) => {
  return (
    <>
      <div>This is the test wrapper</div>
      <div>{otherProps}</div>
      <div>{children}</div>
    </>
  );
};

export const WithPropsWithWrapper = () => {
  return (
    <ConditionalWrapperWithProps
      wrap={TestWrapper}
      condition
      otherProps="This string is from wrapper props"
    >
      <div>test-content 3</div>
    </ConditionalWrapperWithProps>
  );
};

export default {
  title: 'Components/ConditionalWrapper',
};
