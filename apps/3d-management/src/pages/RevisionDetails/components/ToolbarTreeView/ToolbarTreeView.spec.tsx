import React from 'react';

import { screen } from '@testing-library/react';

import {
  ToolbarTreeView,
  ToolbarTreeViewProps,
} from '@3d-management/pages/RevisionDetails/components/ToolbarTreeView/ToolbarTreeView';

import { Cognite3DViewer, CogniteCadModel } from '@cognite/reveal';

import { toolbarTreeViewMswHandlers } from '@3d-management/pages/RevisionDetails/components/ToolbarTreeView/__testUtils__/toolbarTreeViewMswHandlers';
import {
  fixtureModelId,
  fixtureRevisionId,
} from '@3d-management/pages/RevisionDetails/components/ToolbarTreeView/__testUtils__/fixtures/fixtureConsts';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { renderWithProviders } from '@3d-management/utils/test';

jest.mock('antd/lib/notification');

// to mock less 3d-viewer stuff disable some hooks
jest.mock('./hooks/useSelectedNodesHighlights');
jest.mock('./hooks/useCheckedNodesVisibility');
jest.mock('./hooks/useFilteredNodesHighlights');
jest.mock('./hooks/useViewerNodeClickListener');

const viewerMock = {} as Cognite3DViewer;
const modelMock = {
  modelId: fixtureModelId,
  revisionId: fixtureRevisionId,
} as CogniteCadModel;

function ToolbarTreeViewWrapper(
  props: Omit<ToolbarTreeViewProps, 'width' | 'model' | 'viewer'>
) {
  return <ToolbarTreeView {...props} model={modelMock} viewer={viewerMock} />;
}

const server = setupServer(...toolbarTreeViewMswHandlers);

describe('ToolbarTreeView test cases', () => {
  // Enable API mocking before tests.
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  // Disable API mocking after the tests are done.
  afterAll(() => server.close());

  it('loads root node and its children on mount', async () => {
    renderWithProviders(<ToolbarTreeViewWrapper nodesClickable />);
    expect(await screen.findByText('RootNode')).toBeInTheDocument();
    expect(await screen.findByText('Cube')).toBeInTheDocument();
    expect(await screen.findByText('Camera')).toBeInTheDocument();
    expect(await screen.findByText('Light')).toBeInTheDocument();

    // original model doesn't have it, we use fakeCursor in fixture to achieve it
    expect(await screen.findByText('Load more...')).toBeInTheDocument();
  });

  it('loads node children when expand button is clicked', async () => {
    renderWithProviders(<ToolbarTreeViewWrapper nodesClickable />);
    await screen.findByText('Cube');
    const expandBtn = screen
      .getAllByRole('img')
      .find((el) => el.getAttribute('aria-label') === 'plus-square');
    userEvent.click(expandBtn!);

    // shows children
    expect(await screen.findByText('Cube (4)')).toBeInTheDocument();

    // hides loading icon
    expect(
      screen.queryByRole('img', { name: /loading/i })
    ).not.toBeInTheDocument();
  });

  it('loads more children when "Load more" button is clicked', async () => {
    renderWithProviders(<ToolbarTreeViewWrapper nodesClickable />);
    userEvent.click(await screen.findByText('Load more...'));
    expect(await screen.findByText('Fake child')).toBeInTheDocument();
  });
});
