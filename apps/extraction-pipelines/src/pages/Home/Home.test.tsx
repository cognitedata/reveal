import React from 'react';
import { render } from 'utils/test';
import { screen } from '@testing-library/react';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import Home from './Home';
import { mockResponse } from '../../utils/mockResponse';

describe('<Home />', () => {
  test('Renders Home page', async () => {
    sdkv3.get.mockResolvedValue({ data: { items: mockResponse } });
    render(<Home />);
    const headings = screen.getAllByRole('heading');
    expect(headings[0].textContent).toEqual('Integrations');
    expect(headings.length).toEqual(1);
  });
});
