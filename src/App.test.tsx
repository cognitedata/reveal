import React from 'react';
import { render } from '@testing-library/react';
import { Base } from './App.stories';

test('renders learn react link', () => {
  const { getByText } = render(<Base />);
  const linkElement = getByText(/learn about/i);
  expect(linkElement).toBeInTheDocument();
});
