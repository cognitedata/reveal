import { screen } from '@testing-library/react';

import { render } from '../../utils/test';

import { Base, Loading } from './CogniteFlow.stories';

describe('<CogniteFlow />', () => {
  it('Should show tenant selector by default', () => {
    render(<Base />);
    expect(screen.getByText('Specify Cluster')).toBeInTheDocument();
  });

  it('Should auto-focus on page render', async () => {
    render(<Base />);
    expect(screen.queryByPlaceholderText('Enter Company ID')).toHaveFocus();
  });

  it('Should be disabled while loading', async () => {
    render(<Loading />);
    expect(screen.queryByPlaceholderText('Enter Company ID')).toBeDisabled();
  });
});
