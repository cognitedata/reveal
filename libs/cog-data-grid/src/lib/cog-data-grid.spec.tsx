import { render } from '@testing-library/react';

import CogDataGrid from './cog-data-grid';

describe('CogDataGrid', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CogDataGrid />);
    expect(baseElement).toBeTruthy();
  });
});
