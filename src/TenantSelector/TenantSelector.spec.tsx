import React from 'react';
import { render } from 'utils/test';

import { Base, Loading } from './TenantSelector.stories';

describe('<TenantSelector />', () => {
  it('Should auto-focus on page render', async () => {
    const { queryByPlaceholderText } = render(<Base />);
    expect(queryByPlaceholderText('Enter Company ID')).toHaveFocus();
  });

  it('Should be disabled while loading', async () => {
    const { queryByPlaceholderText } = render(<Loading />);
    expect(queryByPlaceholderText('Enter Company ID')).toBeDisabled();
  });
});
