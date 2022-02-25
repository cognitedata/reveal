import { render } from 'utils/test';
import { screen } from '@testing-library/react';

import HomePage from './HomePage';

describe('<HomePage />', () => {
  test('renders correctly', async () => {
    render(<HomePage />);
    expect(await screen.findByText(/Cognite Blueprint/i)).toBeInTheDocument();
  });
});
