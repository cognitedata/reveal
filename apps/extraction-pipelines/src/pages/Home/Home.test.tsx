import React from 'react';
import { render } from 'utils/test';
import { screen } from '@testing-library/react';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { QueryClient } from 'react-query';
import Home from './Home';
import { getMockResponse } from '../../utils/mockResponse';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
  renderWithReactQueryCacheProvider,
} from '../../utils/test/render';

describe('<Home />', () => {
  test('Renders Home page', async () => {
    sdkv3.get.mockResolvedValue({ data: { items: getMockResponse() } });
    const client = new QueryClient();
    const wrapper = renderWithReactQueryCacheProvider(
      client,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      CDF_ENV_GREENFIELD
    );
    render(<Home />, { wrapper });
    const headings = screen.getAllByRole('heading');
    expect(headings[0].textContent).toEqual('Integrations');
    expect(headings.length).toEqual(1);
  });
});
