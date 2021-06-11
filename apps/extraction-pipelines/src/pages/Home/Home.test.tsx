import React from 'react';
import { render } from 'utils/test';
import { screen, waitFor } from '@testing-library/react';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { QueryClient } from 'react-query';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import Home from 'pages/Home';
import { getMockResponse } from 'utils/mockResponse';
import {
  renderWithReQueryCacheSelectedIntegrationContext,
  renderWithSelectedIntegrationContext,
} from 'utils/test/render';
import {
  CDF_ENV_GREENFIELD,
  INTEGRATIONS,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from 'utils/baseURL';
import { EXTRACTION_PIPELINES } from 'utils/constants';

describe('<Home />', () => {
  test('Renders Home page', async () => {
    sdkv3.get.mockResolvedValueOnce({ data: { items: getMockResponse() } });
    sdkv3.get.mockResolvedValueOnce({ data: getMockResponse()[0] });
    sdkv3.datasets.retrieve.mockResolvedValue([]);
    const history = createMemoryHistory();
    const route = `/${PROJECT_ITERA_INT_GREEN}/${INTEGRATIONS}`;
    history.push(route);
    const client = new QueryClient();
    const { wrapper } = renderWithReQueryCacheSelectedIntegrationContext(
      client,
      ORIGIN_DEV,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD,
      getMockResponse()[0]
    );
    render(
      <Router history={history}>
        <Home />
      </Router>,
      { wrapper }
    );
    expect(history.location.pathname).toEqual(route);
    await waitFor(() => {
      screen.getAllByRole('heading');
    });
    const headings = screen.getAllByRole('heading');
    expect(headings[0].textContent).toEqual(EXTRACTION_PIPELINES);
    expect(headings.length).toEqual(1);
  });
  test('Redirects none existing route to integrations home page', async () => {
    const history = createMemoryHistory();
    const nonExistingRoute = `nonexisting-route`;
    const route = `/${PROJECT_ITERA_INT_GREEN}/${INTEGRATIONS}/${nonExistingRoute}`;
    history.push(route);

    renderWithSelectedIntegrationContext(<Home />, {
      client: new QueryClient(),
      initIntegration: null,
    });
    expect(history.location.pathname).toEqual(route);
  });
});
