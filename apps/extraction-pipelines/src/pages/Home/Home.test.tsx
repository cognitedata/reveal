import React from 'react';
import { render } from 'utils/test';
import { screen } from '@testing-library/react';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { QueryClient } from 'react-query';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import Home from './Home';
import { getMockResponse } from '../../utils/mockResponse';
import { renderWithReactQueryCacheProvider } from '../../utils/test/render';
import {
  CDF_ENV_GREENFIELD,
  INTEGRATIONS,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from '../../utils/baseURL';

describe('<Home />', () => {
  let client: QueryClient;
  let wrapper;
  beforeEach(() => {
    client = new QueryClient();
    wrapper = renderWithReactQueryCacheProvider(
      client,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      CDF_ENV_GREENFIELD
    );
  });
  test('Renders Home page', async () => {
    sdkv3.get.mockResolvedValue({ data: { items: getMockResponse() } });

    const history = createMemoryHistory();
    const route = `/${PROJECT_ITERA_INT_GREEN}/${INTEGRATIONS}`;
    history.push(route);
    render(
      <Router history={history}>
        <Home />
      </Router>,
      { wrapper }
    );
    expect(history.location.pathname).toEqual(route);
    const headings = await screen.findAllByRole('heading');
    expect(headings[0].textContent).toEqual('Integrations');
    expect(headings.length).toEqual(1);
  });
  test('Redirects none existing route to integrations home page', async () => {
    const history = createMemoryHistory();
    const route = `/${PROJECT_ITERA_INT_GREEN}/${INTEGRATIONS}/nonexisting-route`;
    history.push(route);

    render(
      <Router history={history}>
        <Home />
      </Router>,
      { wrapper }
    );
    expect(history.location.pathname).toEqual(
      `/${PROJECT_ITERA_INT_GREEN}/${INTEGRATIONS}`
    );
    const headings = await screen.findAllByRole('heading');
    expect(headings[0].textContent).toEqual('Integrations');
    expect(headings.length).toEqual(1);
  });
});
