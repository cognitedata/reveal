import { render } from '@testing-library/react';

import ErrorBoundary from './ErrorBoundary';

describe('ErrorBoundary', () => {
  it('Renders without exploding', () => {
    const { baseElement } = render(
      <ErrorBoundary>
        <div />
      </ErrorBoundary>
    );
    expect(baseElement).toBeTruthy();
  });
});
