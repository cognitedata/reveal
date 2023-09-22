import { render } from '@testing-library/react';

import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('Renders without exploding', () => {
    const { baseElement } = render(<EmptyState />);
    expect(baseElement).toBeTruthy();
  });
});
