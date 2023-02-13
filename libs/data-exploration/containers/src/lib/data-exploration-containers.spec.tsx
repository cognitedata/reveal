import { render } from '@testing-library/react';

import DataExplorationContainers from './data-exploration-containers';

describe('DataExplorationContainers', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DataExplorationContainers />);
    expect(baseElement).toBeTruthy();
  });
});
