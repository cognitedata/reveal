import React from 'react';
import { render } from 'utils/test';
import { Base } from './Home.stories';

describe('<Home />', () => {
  test('renders correct layout', async () => {
    const { getByText } = render(<Base />);
    const linkElement = getByText(/learn about/i);
    expect(linkElement).toBeInTheDocument();
  });
});
