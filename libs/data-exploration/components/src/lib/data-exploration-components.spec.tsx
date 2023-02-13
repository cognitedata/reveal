import { render } from '@testing-library/react';

import DataExplorationComponents from './data-exploration-components';

describe('DataExplorationComponents', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DataExplorationComponents />);
    expect(baseElement).toBeTruthy();
  });
});
