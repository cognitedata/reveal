import React from 'react';
import { render, screen } from '@testing-library/react';

import { ConditionalWrapper } from '../ConditionalWrapper';

describe('ConditionalWrapper', () => {
  const Wrapper: React.FC = (children) => {
    return (
      <div>
        WRAPPER_ADDED
        {children}
      </div>
    );
  };

  it('should not wrap', () => {
    const Test = () => (
      <ConditionalWrapper wrap={Wrapper} condition={false}>
        <div>test-content</div>
      </ConditionalWrapper>
    );

    render(<Test />);

    expect(screen.queryByText('WRAPPER_ADDED')).toBeFalsy();
    expect(screen.getByText('test-content')).toBeInTheDocument();
  });

  it('should wrap', () => {
    const Test = () => (
      <ConditionalWrapper wrap={Wrapper} condition>
        <div>test-content</div>
      </ConditionalWrapper>
    );

    render(<Test />);

    expect(screen.getByText('WRAPPER_ADDED')).toBeInTheDocument();
    expect(screen.getByText('test-content')).toBeInTheDocument();
  });
});
