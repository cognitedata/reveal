import React from 'react';
import { setupServer } from 'msw/node';
import { render, screen } from '@testing-library/react';

import {
  ToolbarTreeView,
  ToolbarTreeViewProps,
} from 'src/pages/RevisionDetails/components/ToolbarTreeView/ToolbarTreeView';

import { Cognite3DViewer, Cognite3DModel } from '@cognite/reveal';
import { Provider } from 'react-redux';
import configureStore from 'src/store';
import { createBrowserHistory } from 'history';
import { mswHandlers } from 'src/pages/RevisionDetails/components/ToolbarTreeView/__testUtils__/mswHandlers';
import {
  fixtureModelId,
  fixtureRevisionId,
} from 'src/pages/RevisionDetails/components/ToolbarTreeView/__testUtils__/fixtures/fixtureConsts';
import userEvent from '@testing-library/user-event';

jest.mock('antd/lib/notification');

// to mock less 3d-viewer stuff disable some hooks
jest.mock('./hooks/useSelectedNodesHighlights');
jest.mock('./hooks/useCheckedNodesVisibility');

function renderWithProviders(component: any) {
  const history = createBrowserHistory();
  const store = configureStore(history);
  return render(<Provider store={store}>{component}</Provider>);
}

const viewerMock = {} as Cognite3DViewer;
const modelMock = {
  modelId: fixtureModelId,
  revisionId: fixtureRevisionId,
} as Cognite3DModel;

function ToolbarTreeViewWrapper(
  props: Omit<ToolbarTreeViewProps, 'width' | 'model' | 'viewer'>
) {
  return (
    <ToolbarTreeView
      {...props}
      model={modelMock}
      width={300}
      viewer={viewerMock}
    />
  );
}

const server = setupServer(...mswHandlers);

describe('ToolbarTreeView test cases', () => {
  // Enable API mocking before tests.
  beforeAll(() => server.listen());

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  // Disable API mocking after the tests are done.
  afterAll(() => server.close());

  it('loads root node and its children on mount', async () => {
    renderWithProviders(<ToolbarTreeViewWrapper />);
    expect(await screen.findByText('RootNode')).toBeTruthy();
    expect(await screen.findByText('Cube')).toBeTruthy();
    expect(await screen.findByText('Camera')).toBeTruthy();
    expect(await screen.findByText('Light')).toBeTruthy();
    // original model doesn't have it, we use fakeCursor to achieve it
    expect(await screen.findByText('Load more...')).toBeTruthy();
  });

  it('loads node children when expand button is clicked', async () => {
    renderWithProviders(<ToolbarTreeViewWrapper />);
    await screen.findByText('Cube');
    const expandBtn = screen
      .getAllByRole('img')
      .find((el) => el.getAttribute('aria-label') === 'plus-square');
    userEvent.click(expandBtn!);
    expect(await screen.findByText('Cube (4)')).toBeTruthy();
  });

  it('loads more children when "Load more" button is clicked', async () => {
    renderWithProviders(<ToolbarTreeViewWrapper />);
    userEvent.click(await screen.findByText('Load more...'));
    expect(await screen.findByText('Fake child')).toBeTruthy();
  });

  // to be fixed in D3M-35
  // eslint-disable-next-line jest/no-commented-out-tests
  // it('sorts items by title', () => {});

  // eslint-disable-next-line jest/no-commented-out-tests
  // it('sorts items by title after clicking "Load more..."', () => {});
});
