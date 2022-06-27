import { screen } from '@testing-library/react';
import { render } from 'utils/test';

import { Base } from './Search.stories';

describe('<Search />', () => {
  test('renders Ask me anything', async () => {
    render(<Base />);
    expect(
      await screen.findByPlaceholderText(/Ask me anything/i)
    ).toBeInTheDocument();
  });
});
