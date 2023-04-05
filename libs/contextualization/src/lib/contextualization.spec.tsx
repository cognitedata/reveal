import { render } from '@testing-library/react';

import Contextualization from './contextualization';

describe('Contextualization', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Contextualization />);
    expect(baseElement).toBeTruthy();
  });
});
