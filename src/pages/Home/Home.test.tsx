import React from 'react';
import { render } from 'utils/test';
import { Base } from './Home.stories';

describe('<Home />', () => {
  test('renders learn react link', async () => {
    const { getByText } = render(<Base />);
    const linkElement = getByText(/My first Cog.js button/i);
    expect(linkElement).toBeInTheDocument();
  });
});
