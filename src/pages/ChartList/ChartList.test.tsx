import React from 'react';
import { render } from 'utils/test';
import { screen } from '@testing-library/react';
import { Base } from './ChartList.stories';

describe('<ChartList />', () => {
  test('renders correctly', async () => {
    render(<Base />);
    expect(await screen.findByText(/SampleChart/i)).toBeInTheDocument();
  });
});
