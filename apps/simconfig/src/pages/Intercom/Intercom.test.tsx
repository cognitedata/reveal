import { screen } from '@testing-library/react';
import { render } from 'utils/test';

import { Base } from './Intercom.stories';

describe('<Intercom />', () => {
  test('renders main page', async () => {
    render(<Base />);
    expect(
      await screen.findByText(/How to implement Intercom/i)
    ).toBeInTheDocument();
  });
});
