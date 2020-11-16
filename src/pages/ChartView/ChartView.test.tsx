import React from 'react';
import { render } from 'utils/test';
import { Base } from './ChartView.stories';

describe('<ChartView />', () => {
  test('renders correctly', async () => {
    render(<Base />);
    // expect(await screen.findByText(/11-ESDV-90020 Chart/i)).toBeInTheDocument();
  });
});
