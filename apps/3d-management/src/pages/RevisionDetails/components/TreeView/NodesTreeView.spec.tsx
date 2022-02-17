import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import NodesTreeView, {
  NodesTreeViewProps,
} from 'pages/RevisionDetails/components/TreeView/NodesTreeView';
import {
  TreeDataNode,
  TreeLoadMoreNode,
} from 'pages/RevisionDetails/components/TreeView/types';
import { node3dToTreeDataNode } from 'pages/RevisionDetails/components/TreeView/utils/converters';
import userEvent from '@testing-library/user-event';
import { SelectedNode } from 'store/modules/TreeView';
import { treeViewFocusContainerId } from 'pages/RevisionDetails/components/ToolbarTreeView/treeViewFocusContainerId';
import { convertKeysToSelectedNodes } from 'pages/RevisionDetails/components/TreeView/utils/treeViewMultiselectionUtils';
import { TrackedKeys } from 'pages/RevisionDetails/components/TreeView/hooks/useKeyboardHandler';

const LOAD_MORE = 'Load more...';
type ShortTreeNodeRecord = {
  name: string;
  treeIndex: number;
  children?: Array<ShortTreeNodeRecord | typeof LOAD_MORE>;
};

// shorter notation to create treeView mock
function treeNode(
  node: ShortTreeNodeRecord | typeof LOAD_MORE,
  { depth = 0, parentId = -1 } = {}
): TreeDataNode {
  if (node === 'Load more...') {
    const cursorNode: TreeLoadMoreNode = {
      key: `cursor-parent-${parentId}`,
      cursor: `cursor-parent-${parentId}`,
      title: 'Load more...',
      parent: { nodeId: parentId, treeIndex: parentId },
    };
    // @ts-ignore that's totally wrong in terms of types, but it's okay here
    return cursorNode;
  }
  const { name, treeIndex, children } = node;
  // conversion is done here not to mimic internal implementation, but to write less lines of code
  return {
    ...node3dToTreeDataNode([
      { name, id: treeIndex, subtreeSize: 999, depth, treeIndex, parentId },
    ])[0],
    children: children?.map((ch) => {
      return treeNode(ch, { depth: depth + 1, parentId: treeIndex });
    }) as TreeDataNode[],
  } as TreeDataNode;
}

function getTreeData(): TreeDataNode[] {
  return [
    treeNode({
      treeIndex: 0,
      name: 'RootNode',
      children: [
        {
          name: '0-0',
          treeIndex: 1,
          children: [
            {
              name: '0-0-0',
              treeIndex: 2,
            },
            {
              name: '0-0-1',
              treeIndex: 3,
              children: [
                {
                  name: '0-0-1-0',
                  treeIndex: 4,
                },
                {
                  name: '0-0-1-1',
                  treeIndex: 5,
                },
                'Load more...',
              ],
            },
          ],
        },
        {
          name: '0-1',
          treeIndex: 11,
        },
        {
          name: '0-2',
          treeIndex: 21,
          children: [
            {
              name: '0-2-0',
              treeIndex: 22,
            },
          ],
        },
        'Load more...',
      ],
    }),
  ];
}

// NodesTreeView is controlled component, so in order to test
// multiselection with ctrl properly we have to keep selectedNodes up to date
function TreeViewStateful({
  treeData = getTreeData(),
  onSelect = () => {},
  onExpand = () => {},
  onCheck = () => {},
  loadChildren = () => Promise.resolve(),
  loadSiblings = () => Promise.resolve(),
  checkedKeys: initialCheckedKeys = [0],
  expandedKeys: initialExpandedKeys = [0, 1, 2, 3, 4, 11, 21],
  selectedNodes: initialSelectedNodes = [],
  ...props
}: Partial<NodesTreeViewProps>) {
  const [checkedKeys, setCheckedKeys] = React.useState(initialCheckedKeys);
  const [expandedKeys, setExpandedKeys] = React.useState(initialExpandedKeys);
  const [selectedNodes, setSelectedNodes] = React.useState<SelectedNode[]>(
    initialSelectedNodes
  );

  return (
    // fixme that's not good at all that keyboard handlers just don't work without that magic focus id
    //  should be some default ref or other selector to be used as fallback in NodesTreeView
    <div
      tabIndex={-1}
      id={treeViewFocusContainerId}
      data-testid={treeViewFocusContainerId}
    >
      <NodesTreeView
        treeData={treeData}
        checkedKeys={checkedKeys}
        expandedKeys={expandedKeys}
        selectedNodes={selectedNodes}
        onSelect={(arg) => {
          setSelectedNodes(arg);
          onSelect(arg);
        }}
        onCheck={(arg) => {
          setCheckedKeys(arg);
          onCheck(arg);
        }}
        onExpand={(arg) => {
          setExpandedKeys(arg);
          onExpand(arg);
        }}
        height={300}
        loadChildren={loadChildren}
        loadSiblings={loadSiblings}
        onNodeInfoRequest={() => {}}
        {...props}
      />
    </div>
  );
}

function selectedNodesToTreeIndices(nodes: SelectedNode[]) {
  return nodes.map((node) => node.treeIndex);
}

describe('NodesTreeView test cases', () => {
  it('renders and shows passed treeData', async () => {
    render(<TreeViewStateful treeData={getTreeData()} />);

    // some initial await helps to overcome "not wrapped in act(...)" warning
    // more info https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning#how-to-fix-the-act-warning
    await screen.findByText('RootNode');

    expect(screen.queryByText('RootNode')).toBeInTheDocument();
    expect(screen.queryByText('0-0')).toBeInTheDocument();
    expect(screen.queryByText('0-0-1-0')).toBeInTheDocument();
    expect(screen.queryByText('0-2')).toBeInTheDocument();
    expect(screen.queryAllByText(LOAD_MORE)).toHaveLength(2);
  });

  it('triggers `loadSiblings` when "Load more" is clicked', async () => {
    const onSelect = jest.fn();
    const loadSiblings = jest.fn();
    render(
      <TreeViewStateful onSelect={onSelect} loadSiblings={loadSiblings} />
    );
    const loadMoreOptions = await screen.findAllByText('Load more...');

    userEvent.click(loadMoreOptions[0]);

    expect(onSelect).toBeCalledTimes(0);
    expect(loadSiblings).toBeCalledTimes(1);
    expect(loadSiblings).toBeCalledWith(
      expect.objectContaining({
        parent: {
          nodeId: 3,
          treeIndex: 3,
        },
      })
    );
  });

  describe('Selection handlers', () => {
    it('selects one node with common click', async () => {
      const onSelect = jest.fn();
      render(
        <TreeViewStateful
          onSelect={(n) => onSelect(selectedNodesToTreeIndices(n))}
        />
      );

      userEvent.click(await screen.findByText('0-0'));

      expect(onSelect).toBeCalledTimes(1);
      expect(onSelect).toBeCalledWith([1]);
      onSelect.mockReset();

      userEvent.click(screen.getByText('RootNode'));

      expect(onSelect).toBeCalledTimes(1);
      expect(onSelect).toBeCalledWith([0]);
    });

    it('selects multiple nodes with ctrl+click', async () => {
      // clickN1 -> ctrlClickN2 -> only 2 nodes selected
      const onSelect = jest.fn();
      render(
        <TreeViewStateful
          onSelect={(n) => {
            onSelect(selectedNodesToTreeIndices(n));
          }}
        />
      );

      userEvent.click(await screen.findByText('0-0'));
      onSelect.mockReset();

      userEvent.click(screen.getByText('0-2'), { ctrlKey: true });

      expect(onSelect).toBeCalledTimes(1);
      expect(onSelect).toBeCalledWith([1, 21]);
      onSelect.mockReset();

      // unselect
      userEvent.click(screen.getByText('0-2'), { ctrlKey: true });

      expect(onSelect).toBeCalledTimes(1);
      expect(onSelect).toBeCalledWith([1]);
    });

    describe('Range of nodes with shift+click', () => {
      it('selects a range of nodes with shift+click', async () => {
        // clickN1 -> shift+clickN2 -> all nodes between N1...N2 selected
        const onSelect = jest.fn();
        render(
          <TreeViewStateful
            onSelect={(n) => {
              onSelect(selectedNodesToTreeIndices(n));
            }}
          />
        );
        userEvent.click(await screen.findByText('0-0-0'));

        expect(onSelect).toBeCalledWith([2]);

        userEvent.click(screen.getByText('0-1'), { shiftKey: true });

        expect(onSelect).toHaveBeenNthCalledWith(2, [2, 3, 4, 5, 11]);

        // it "remembers start node of the range"
        // then click N0 -> all nodes between N0..N1 selected instead

        userEvent.click(screen.getByText('RootNode'), { shiftKey: true });

        expect(onSelect).toHaveBeenNthCalledWith(3, [0, 1, 2]);
        expect(onSelect).toBeCalledTimes(3);
      });
    });
  });

  describe('Keyboard handlers', () => {
    describe('arrow UP', () => {
      it('moves selection UP from the last selected node', async () => {
        const onSelect = jest.fn();
        render(
          <TreeViewStateful
            onSelect={(n) => {
              onSelect(selectedNodesToTreeIndices(n));
            }}
          />
        );

        // after common click
        userEvent.click(await screen.findByText('0-0-0'));
        onSelect.mockReset();

        fireEvent.focus(screen.queryByTestId(treeViewFocusContainerId)!);
        fireEvent.keyDown(document.activeElement!, {
          key: TrackedKeys.ArrowUp,
        }); // moved to 0-0

        expect(onSelect).toBeCalledWith([1]);

        // after ctrl click
        userEvent.click(screen.getByText('0-0-1-1'), { ctrlKey: true });
        expect(onSelect).toHaveBeenNthCalledWith(2, [1, 5]);

        fireEvent.keyDown(document.activeElement!, {
          key: TrackedKeys.ArrowUp,
        }); // moved to 0-0-1-0
        expect(onSelect).toHaveBeenNthCalledWith(3, [4]);

        // after shift click (range from bot to top)
        userEvent.click(screen.getByText('0-0-0'), { shiftKey: true });
        expect(onSelect).toHaveBeenNthCalledWith(4, [2, 3, 4]);

        fireEvent.keyDown(document.activeElement!, {
          key: TrackedKeys.ArrowUp,
        }); // moved to 0-0
        expect(onSelect).toHaveBeenNthCalledWith(5, [1]);

        // after shift click (range from top to bot)
        userEvent.click(screen.getByText('0-0-1-0'), { shiftKey: true });
        expect(onSelect).toHaveBeenNthCalledWith(6, [1, 2, 3, 4]);

        fireEvent.keyDown(document.activeElement!, {
          key: TrackedKeys.ArrowUp,
        }); // moved to 0-0-1
        expect(onSelect).toHaveBeenNthCalledWith(7, [3]);

        // with shift key hold
        fireEvent.keyDown(document.activeElement!, {
          key: TrackedKeys.ArrowUp,
          shiftKey: true,
        }); // moved to 0-0-0
        expect(onSelect).toHaveBeenNthCalledWith(8, [2, 3]);

        fireEvent.keyDown(document.activeElement!, {
          key: TrackedKeys.ArrowUp,
          shiftKey: true,
        }); // moved to 0-0
        expect(onSelect).toHaveBeenNthCalledWith(9, [1, 2, 3]);
        expect(onSelect).toBeCalledTimes(9);
      });

      it('respects expanded state', async () => {
        const onSelect = jest.fn();
        render(
          <TreeViewStateful
            expandedKeys={[0, 1]}
            onSelect={(n) => {
              onSelect(selectedNodesToTreeIndices(n));
            }}
          />
        );

        userEvent.click(await screen.findByText('0-1'));
        onSelect.mockReset();

        fireEvent.focus(screen.queryByTestId(treeViewFocusContainerId)!);
        fireEvent.keyDown(document.activeElement!, {
          key: TrackedKeys.ArrowUp,
        }); // moved to 0-0-1
        expect(onSelect).toBeCalledTimes(1);
        expect(onSelect).toBeCalledWith([3]);
      });

      it('selects the root node if nothing is selected', async () => {
        const onSelect = jest.fn();
        render(
          <TreeViewStateful
            onSelect={(n) => {
              onSelect(selectedNodesToTreeIndices(n));
            }}
          />
        );

        (await screen.findByTestId(treeViewFocusContainerId)).focus();
        fireEvent.keyDown(document.activeElement!, {
          key: TrackedKeys.ArrowUp,
        });
        expect(onSelect).toBeCalledTimes(1);
        expect(onSelect).toBeCalledWith([0]);
      });
    });

    describe('arrow DOWN', () => {
      it('moves selection DOWN from the last selected node', async () => {
        const onSelect = jest.fn();
        render(
          <TreeViewStateful
            onSelect={(n) => {
              onSelect(selectedNodesToTreeIndices(n));
            }}
          />
        );

        // after common click
        userEvent.click(await screen.findByText('0-0-1'));
        onSelect.mockReset();

        fireEvent.focus(screen.queryByTestId(treeViewFocusContainerId)!);
        fireEvent.keyDown(document.activeElement!, {
          key: TrackedKeys.ArrowDown,
        }); // moved to 0-0-1-0

        expect(onSelect).toBeCalledWith([4]);

        // after ctrl click
        userEvent.click(screen.getByText('0-1'), { ctrlKey: true });
        expect(onSelect).toHaveBeenNthCalledWith(2, [4, 11]);

        fireEvent.keyDown(document.activeElement!, {
          key: TrackedKeys.ArrowDown,
        }); // moved to 0-2
        expect(onSelect).toHaveBeenNthCalledWith(3, [21]);

        // after shift click (range from bot to top)
        userEvent.click(screen.getByText('0-0-0'), { shiftKey: true });
        expect(onSelect).toHaveBeenNthCalledWith(4, [2, 3, 4, 5, 11, 21]);

        fireEvent.keyDown(document.activeElement!, {
          key: TrackedKeys.ArrowDown,
        }); // moved to 0-0-1
        expect(onSelect).toHaveBeenNthCalledWith(5, [3]);

        // after shift click (range from top to bot)
        userEvent.click(screen.getByText('0-0-1-1'), { shiftKey: true });
        expect(onSelect).toHaveBeenNthCalledWith(6, [3, 4, 5]);

        fireEvent.keyDown(document.activeElement!, {
          key: TrackedKeys.ArrowDown,
        }); // moved to 0-1
        expect(onSelect).toHaveBeenNthCalledWith(7, [11]);

        // with shift key hold
        fireEvent.keyDown(document.activeElement!, {
          key: TrackedKeys.ArrowDown,
          shiftKey: true,
        }); // moved to 0-2
        expect(onSelect).toHaveBeenNthCalledWith(8, [11, 21]);

        fireEvent.keyDown(document.activeElement!, {
          key: TrackedKeys.ArrowDown,
          shiftKey: true,
        }); // moved to 0-2-0
        expect(onSelect).toHaveBeenNthCalledWith(9, [11, 21, 22]);
        expect(onSelect).toBeCalledTimes(9);
      });

      it('respects expanded state', async () => {
        const onSelect = jest.fn();
        render(
          <TreeViewStateful
            expandedKeys={[0, 1]}
            onSelect={(n) => {
              onSelect(selectedNodesToTreeIndices(n));
            }}
          />
        );

        userEvent.click(await screen.findByText('RootNode'));
        onSelect.mockReset();

        fireEvent.focus(screen.queryByTestId(treeViewFocusContainerId)!);

        fireEvent.keyDown(document.activeElement!, {
          key: TrackedKeys.ArrowDown,
        }); // moved to 0-0
        fireEvent.keyDown(document.activeElement!, {
          key: TrackedKeys.ArrowDown,
        }); // moved to 0-0-0
        fireEvent.keyDown(document.activeElement!, {
          key: TrackedKeys.ArrowDown,
        }); // moved to 0-0-1
        fireEvent.keyDown(document.activeElement!, {
          key: TrackedKeys.ArrowDown,
        }); // moved to 0-1

        expect(onSelect).toBeCalledTimes(4);
        expect(onSelect).toHaveBeenNthCalledWith(1, [1]);
        expect(onSelect).toHaveBeenNthCalledWith(2, [2]);
        expect(onSelect).toHaveBeenNthCalledWith(3, [3]);
        expect(onSelect).toHaveBeenNthCalledWith(4, [11]);
      });

      it('selects the root node if nothing is selected', async () => {
        const onSelect = jest.fn();
        render(
          <TreeViewStateful
            onSelect={(n) => {
              onSelect(selectedNodesToTreeIndices(n));
            }}
          />
        );

        (await screen.findByTestId(treeViewFocusContainerId)).focus();
        fireEvent.keyDown(document.activeElement!, {
          key: TrackedKeys.ArrowDown,
        });
        expect(onSelect).toBeCalledTimes(1);
        expect(onSelect).toBeCalledWith([0]);
      });
    });

    it('expands all selected nodes on RIGHT arrow pressed', async () => {
      const selectedNodes = convertKeysToSelectedNodes(getTreeData(), [1, 21]);
      render(
        <TreeViewStateful expandedKeys={[0]} selectedNodes={selectedNodes} />
      );
      (await screen.findByTestId(treeViewFocusContainerId)).focus();

      expect(screen.queryByText('0-0-0')).not.toBeInTheDocument();
      expect(screen.queryByText('0-2-0')).not.toBeInTheDocument();

      fireEvent.keyDown(document.activeElement!, {
        key: TrackedKeys.ArrowRight,
      });

      expect(await screen.findByText('0-0-0')).toBeVisible();
      expect(screen.getByText('0-2-0')).toBeVisible();
    });

    it('collapses all selected nodes on LEFT arrow pressed', async () => {
      const selectedNodes = convertKeysToSelectedNodes(getTreeData(), [1, 21]);
      render(
        <TreeViewStateful
          expandedKeys={[0, 1, 21]}
          selectedNodes={selectedNodes}
        />
      );
      expect(await screen.findByText('0-0-0')).toBeVisible();
      expect(screen.getByText('0-2-0')).toBeVisible();

      screen.getByTestId(treeViewFocusContainerId).focus();

      fireEvent.keyDown(document.activeElement!, {
        key: TrackedKeys.ArrowLeft,
      });

      expect(screen.queryByText('0-0-0')).not.toBeInTheDocument();
      expect(screen.queryByText('0-2-0')).not.toBeInTheDocument();
    });

    it('removes the selection on ESC is pressed', async () => {
      const selectedNodes = convertKeysToSelectedNodes(getTreeData(), [1, 21]);
      const onSelect = jest.fn();
      render(
        <TreeViewStateful
          onSelect={(n) => onSelect(selectedNodesToTreeIndices(n))}
          selectedNodes={selectedNodes}
        />
      );

      (await screen.findByTestId(treeViewFocusContainerId)).focus();

      fireEvent.keyDown(document.activeElement!, {
        key: TrackedKeys.Escape,
      });
      expect(onSelect).toBeCalledTimes(1);
      expect(onSelect).toBeCalledWith([]);
    });

    it('toggles the selected nodes on SPACE/ENTER is pressed', async () => {
      const onCheck = jest.fn();
      render(
        <TreeViewStateful
          checkedKeys={[]}
          onCheck={onCheck}
          selectedNodes={convertKeysToSelectedNodes(getTreeData(), [1, 21])}
        />
      );

      (await screen.findByTestId(treeViewFocusContainerId)).focus();

      fireEvent.keyDown(document.activeElement!, {
        key: TrackedKeys[' '],
      });
      expect(onCheck).toBeCalledTimes(1);
      expect(onCheck).toBeCalledWith(
        // eslint-disable-next-line prettier/prettier
        [/* 0, */ 1, 2, 3, 4, 5, /* 11, */ 21, 22]
      );
    });

    it('correctly updates checked hierarchy on SPACE/ENTER is pressed', async () => {
      const onCheck = jest.fn();
      render(
        <TreeViewStateful
          checkedKeys={[/* 0, 1, 2, 3, 4, 5, */ 11, 21, 22]}
          onCheck={onCheck}
          selectedNodes={convertKeysToSelectedNodes(getTreeData(), [22])}
        />
      );

      (await screen.findByTestId(treeViewFocusContainerId)).focus();

      fireEvent.keyDown(document.activeElement!, {
        key: TrackedKeys[' '],
      });
      expect(onCheck).toHaveBeenNthCalledWith(
        1,
        // eslint-disable-next-line prettier/prettier
        [/* 0, 1, 2, 3, 4, 5, */ 11 /* 21, 22 */]
      );

      fireEvent.keyDown(document.activeElement!, {
        key: TrackedKeys[' '],
      });
      expect(onCheck).toHaveBeenNthCalledWith(
        2,
        // eslint-disable-next-line prettier/prettier
        [/* 0, 1, 2, 3, 4, 5, */ 11, 22, 21]
      );
      expect(onCheck).toBeCalledTimes(2);
    });
  });
});
