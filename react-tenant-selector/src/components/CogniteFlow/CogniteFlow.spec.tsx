import React from 'react';
import { render } from '../../utils/test';

import { Base, Loading } from './CogniteFlow.stories';

describe('<CogniteFlow />', () => {
  it('Should show tenant selector by default', () => {
    const { getByText } = render(<Base />);
    expect(getByText('Specify cluster')).toBeInTheDocument();
  });

  it('Should auto-focus on page render', async () => {
    const { queryByPlaceholderText } = render(<Base />);
    expect(queryByPlaceholderText('Enter Company ID')).toHaveFocus();
  });

  it('Should be disabled while loading', async () => {
    const { queryByPlaceholderText } = render(<Loading />);
    expect(queryByPlaceholderText('Enter Company ID')).toBeDisabled();
  });
});
