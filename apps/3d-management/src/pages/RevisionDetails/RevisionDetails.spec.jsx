import { setupServer } from 'msw/node';
import { renderWithProviders } from 'utils/test';
import React from 'react';
import { createMemoryHistory } from 'history';
import { screen } from '@testing-library/react';
import { isReprocessingRequired } from 'utils/sdk/3dApiUtils';
import RevisionDetails from './RevisionDetails';
import {
  fixtureModelId,
  fixtureRevisionId,
  revisionDetailsMswHandlers,
} from './__testUtils__/revisionDetailsMswHandlers';

jest.mock('@cognite/reveal', () => {
  return {
    Cognite3DViewer: jest.fn(),
  };
});
jest.mock('utils/sdk/3dApiUtils');

const server = setupServer(...revisionDetailsMswHandlers);

function WithRouterProps({ modelId, revisionId, children }) {
  const location = {
    hash: '',
    pathname: `/3ddemo/3d-models/${modelId}/revisions/${revisionId}`,
    search: '',
  };
  const match = {
    isExact: true,
    params: {
      modelId: `${modelId}`,
      revisionId: `${revisionId}`,
      tenant: '3ddemo',
    },
    path: '/:tenant/3d-models/:modelId/revisions/:revisionId',
    url: `/3ddemo/3d-models/${modelId}/revisions/${revisionId}`,
  };

  const history = createMemoryHistory({
    initialEntries: [location.pathname],
  });

  return children({ history, location, match });
}

describe('RevisionDetails', () => {
  // Enable API mocking before tests.
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' });
  });

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  // Disable API mocking after the tests are done.
  afterAll(() => server.close());

  test('Open revision details for a model which needs reprocessing', async () => {
    let resolveIsReprocessingRequiredWithValue;
    isReprocessingRequired.mockImplementationOnce(() => {
      return new Promise((r) => {
        resolveIsReprocessingRequiredWithValue = r;
      });
    });

    renderWithProviders(
      <WithRouterProps modelId={fixtureModelId} revisionId={fixtureRevisionId}>
        {(routerProps) => <RevisionDetails {...routerProps} />}
      </WithRouterProps>
    );

    // thumbnail is not visible until we know viewer type

    expect(await screen.findByText('Loading...')).toBeInTheDocument();
    resolveIsReprocessingRequiredWithValue(true);
    expect(await screen.findByLabelText('Open 3d-viewer')).toBeInTheDocument();

    // reprocess button is visible

    expect(screen.queryByText('Reprocess')).toBeInTheDocument();
  });

  test('Open revision details for reveal compatible model', async () => {
    let resolveIsReprocessingRequiredWithValue;
    isReprocessingRequired.mockImplementationOnce(() => {
      return new Promise((r) => {
        resolveIsReprocessingRequiredWithValue = r;
      });
    });

    renderWithProviders(
      <WithRouterProps modelId={fixtureModelId} revisionId={fixtureRevisionId}>
        {(routerProps) => <RevisionDetails {...routerProps} />}
      </WithRouterProps>
    );

    // thumbnail is not visible until we know viewer type

    expect(await screen.findByText('Loading...')).toBeInTheDocument();
    resolveIsReprocessingRequiredWithValue(false);
    expect(await screen.findByLabelText('Open 3d-viewer')).toBeInTheDocument();

    // reprocess button is hidden

    expect(screen.queryByText('Reprocess')).not.toBeInTheDocument();
  });
});
