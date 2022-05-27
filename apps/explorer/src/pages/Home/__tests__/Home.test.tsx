import '__mocks/mockContainerAuth';
import '__mocks/mockCognite3DViewer';
import { screen } from '@testing-library/react';
import { render } from 'utils/test';

import { Home } from '../Home';

describe('<Home />', () => {
  test('Load Home screen', async () => {
    render(<Home />);
    expect(
      await screen.findByText(/What are you looking for?/i)
    ).toBeInTheDocument();
  });
});
