import React from 'react';
import { render } from 'utils/test';
import { screen, waitFor } from '@testing-library/react';
import sdk from '@cognite/cdf-sdk-singleton';
import { QueryClient } from 'react-query';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import Home from 'pages/Home';
import { getMockResponse } from 'utils/mockResponse';
import {
  renderWithReQueryCacheSelectedExtpipeContext,
  renderWithSelectedExtpipeContext,
} from 'utils/test/render';
import {
  CDF_ENV_GREENFIELD,
  EXTRACTION_PIPELINES_PATH,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from 'utils/baseURL';
import { EXTRACTION_PIPELINES } from 'utils/constants';
// eslint-disable-next-line
import { useCapabilities } from '@cognite/sdk-react-query-hooks';
import { EXTRACTION_PIPELINES_ACL } from 'model/AclAction';

describe('<Home />', () => {
  beforeAll(() => {
    useCapabilities.mockReturnValue({
      isLoading: false,
      data: [{ acl: EXTRACTION_PIPELINES_ACL, actions: ['READ', 'WRITE'] }],
    });
  });

  test.skip('Renders Home page', async () => {
    sdk.get.mockResolvedValueOnce({ data: { items: getMockResponse() } });
    sdk.get.mockResolvedValueOnce({ data: getMockResponse()[0] });
    sdk.datasets.retrieve.mockResolvedValue([]);
    const history = createMemoryHistory();
    const route = `/${PROJECT_ITERA_INT_GREEN}/${EXTRACTION_PIPELINES_PATH}`;
    history.push(route);
    const client = new QueryClient();
    const { wrapper } = renderWithReQueryCacheSelectedExtpipeContext(
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
  test('Redirects none existing route to extpipes home page', async () => {
    const history = createMemoryHistory();
    const nonExistingRoute = `nonexisting-route`;
    const route = `/${PROJECT_ITERA_INT_GREEN}/${EXTRACTION_PIPELINES_PATH}/${nonExistingRoute}`;
    history.push(route);

    renderWithSelectedExtpipeContext(<Home />, {
      client: new QueryClient(),
      initExtpipe: null,
    });
    expect(history.location.pathname).toEqual(route);
  });
});
