import { screen } from '@testing-library/react';
import { render } from 'utils/test';

import { Base } from './Home.stories';

describe('<Home />', () => {
  test('renders home title', async () => {
    render(<Base />);
    expect(
      await screen.findByText(/Welcome to the Cognite Power Ops/i)
    ).toBeInTheDocument();
  });
});
