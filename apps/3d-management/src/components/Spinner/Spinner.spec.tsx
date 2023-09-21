import { render } from '@testing-library/react';

import Spinner from './Spinner';

describe('Spinner', () => {
  it('Renders without exploding', () => {
    const { baseElement } = render(<Spinner />);
    expect(baseElement).toBeTruthy();
  });
});
