import React from 'react';
import { render, screen } from '@testing-library/react';

import {
  WithPropsWithWrapper,
  BaseWithWrapper,
  BaseWithoutWrapper,
} from '../__stories__/ConditionalWrapper.stories';

describe('ConditionalWrapper', () => {
  it('should not wrap', () => {
    render(<BaseWithoutWrapper />);

    expect(screen.queryByText('WRAPPER_ADDED')).toBeFalsy();
    expect(screen.getByText('test-content 1')).toBeInTheDocument();
  });

  it('should wrap', () => {
    render(<BaseWithWrapper />);

    expect(screen.getByText('WRAPPER_ADDED')).toBeInTheDocument();
    expect(screen.getByText('test-content 2')).toBeInTheDocument();
  });

  it('should wrap with props', () => {
    render(<WithPropsWithWrapper />);

    expect(
      screen.getByText('This string is from wrapper props')
    ).toBeInTheDocument();

    expect(screen.getByText('This is the test wrapper')).toBeInTheDocument();

    expect(screen.getByText('test-content 3')).toBeInTheDocument();
  });
});
