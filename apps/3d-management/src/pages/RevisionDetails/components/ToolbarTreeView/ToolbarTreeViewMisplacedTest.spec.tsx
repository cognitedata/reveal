import React from 'react';
import { setupServer } from 'msw/node';
import { render, screen } from '@testing-library/react';

import {
  ToolbarTreeView,
  ToolbarTreeViewProps,
} from 'pages/RevisionDetails/components/ToolbarTreeView/ToolbarTreeView';

import { Cognite3DViewer, Cognite3DModel } from '@cognite/reveal';
import { Provider } from 'react-redux';
import configureStore from 'store';
import { createBrowserHistory } from 'history';
import { toolbarTreeViewMswHandlers } from 'pages/RevisionDetails/components/ToolbarTreeView/__testUtils__/toolbarTreeViewMswHandlers';
import {
  fixtureCubeNodeFirstChildId,
  fixtureModelId,
  fixtureRevisionId,
} from 'pages/RevisionDetails/components/ToolbarTreeView/__testUtils__/fixtures/fixtureConsts';
import { expandArbitraryNode } from 'store/modules/TreeView';

jest.mock('antd/lib/notification');

// to mock less 3d-viewer stuff disable some hooks
jest.mock('./hooks/useSelectedNodesHighlights');
jest.mock('./hooks/useCheckedNodesVisibility');
jest.mock('./hooks/useFilteredNodesHighlights');
jest.mock('./hooks/useViewerNodeClickListener');

const history = createBrowserHistory();
const store = configureStore(history);
const { dispatch } = store;

function renderWithProviders(component: any) {
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
  return <ToolbarTreeView {...props} model={modelMock} viewer={viewerMock} />;
}

const server = setupServer(...toolbarTreeViewMswHandlers);

/*
 * Temporarily moved one "bad test" here from ToolbarTreeView.spec.
 * it should be rewritten by doing something like that:
 * https://redux.js.org/recipes/writing-tests#async-action-creators
 * we basically need to test how store state changes after we call the action
 */
describe('ToolbarTreeView expand into node test', () => {
  // Enable API mocking before tests.
  beforeAll(() => server.listen());

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  // Disable API mocking after the tests are done.
  afterAll(() => server.close());

  // todo: rewrite. Test the action itself.
  // alternative: write test component that will dispatch that expandArbitraryNode action
  // currently there is no test isolation (store is outside which is too bad)
  it('loads ancestors of the specified nodeId and adds them into the tree', async () => {
    renderWithProviders(<ToolbarTreeViewWrapper />);

    expect(await screen.findByText('Cube')).toBeInTheDocument();
    expect(screen.queryByText('Cube (1)')).not.toBeInTheDocument();
    // eslint-disable-next-line jest-dom/prefer-in-document
    expect(screen.queryAllByText('Load more...')).toHaveLength(1);

    // expect tree state
    /*
     * RootNode
     *  child1
     *  Cube
     *    Cube (1)
     *    Load more
     *  Load more
     */

    dispatch(
      // @ts-ignore
      expandArbitraryNode({
        treeIndex: 4,
        nodeId: fixtureCubeNodeFirstChildId,
      })
    );

    expect(await screen.findByText('Cube (1)')).toBeInTheDocument();
    expect(screen.queryAllByText('Load more...')).toHaveLength(2);
  });
});
