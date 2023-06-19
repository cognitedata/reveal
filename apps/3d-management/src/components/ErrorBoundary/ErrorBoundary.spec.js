import React from 'react';
import { shallow } from 'enzyme';
import ErrorBoundary from './ErrorBoundary';

describe('ErrorBoundary', () => {
  it('Renders without exploding', () => {
    const wrapper = shallow(
      <ErrorBoundary>
        <div />
      </ErrorBoundary>
    );
    expect(wrapper).toHaveLength(1);
  });
});
