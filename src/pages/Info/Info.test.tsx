import React from 'react';
import { render } from 'utils/test';
import { screen } from '@testing-library/react';
import { Base } from './Info.stories';

describe('<Info />', () => {
  test('renders learn more about link', async () => {
    render(<Base />);
    expect(await screen.findByText(/learn more about/i)).toBeInTheDocument();
  });
});
