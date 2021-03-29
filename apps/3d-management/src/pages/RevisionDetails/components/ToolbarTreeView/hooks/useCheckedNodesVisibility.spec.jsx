import { useCheckedNodesVisibility } from 'src/pages/RevisionDetails/components/ToolbarTreeView/hooks/useCheckedNodesVisibility';
import { getNodeByTreeIndex } from 'src/pages/RevisionDetails/components/TreeView/utils/treeFunctions';
import { render } from '@testing-library/react';
import React from 'react';
import { sleep } from 'src/utils';

function TestComponent({ model, treeData, checkedKeys }) {
  useCheckedNodesVisibility({ model, treeData, checkedKeys });
  return null;
}

describe('useCheckedNodesVisibility tests', () => {
  it('correctly updates nodes visibility in reveal', async () => {
    const treeData = [
      {
        key: 0,
        meta: {
          id: 7587176698924415,
          treeIndex: 0,
          depth: 0,
          name: 'RootNode',
          subtreeSize: 10,
        },
        children: [
          {
            key: 2,
            meta: {
              id: 4118495943076177,
              treeIndex: 2,
              parentId: 7587176698924415,
              depth: 1,
              name: 'Camera',
              subtreeSize: 1,
            },
          },
          {
            key: 3, // 3,4,5,6,7
            meta: {
              id: 3518215128723287,
              treeIndex: 3,
              parentId: 7587176698924415,
              depth: 1,
              name: 'Cube',
              subtreeSize: 5,
            },
            children: [
              {
                key: 4,
                meta: {
                  id: 172917895243234,
                  treeIndex: 4,
                  parentId: 3518215128723287,
                  depth: 2,
                  name: 'Cube (1)',
                  subtreeSize: 1,
                },
              },
              {
                key: 5,
                meta: {
                  id: 5528114778128032,
                  treeIndex: 5,
                  parentId: 3518215128723287,
                  depth: 2,
                  name: 'Cube (2)',
                  subtreeSize: 1,
                },
              },
              {
                key: 6,
                meta: {
                  id: 4086799595416334,
                  treeIndex: 6,
                  parentId: 3518215128723287,
                  depth: 2,
                  name: 'Cube (3)',
                  subtreeSize: 1,
                },
              },
              {
                key: 7,
                meta: {
                  id: 6444092424355782,
                  treeIndex: 7,
                  parentId: 3518215128723287,
                  depth: 2,
                  name: 'Cube (4)',
                  subtreeSize: 1,
                  boundingBox: {
                    max: [100, 100.00001525878906, 100.00001525878906],
                    min: [-100, -100.00001525878906, -100.00001525878906],
                  },
                },
              },
            ],
          },
          {
            key: 1,
            meta: {
              id: 6025029534731389,
              treeIndex: 1,
              parentId: 7587176698924415,
              depth: 1,
              name: 'Light',
              subtreeSize: 1,
            },
          },
          {
            key: 8, // 8, (9)
            meta: {
              id: 888,
              treeIndex: 8,
              parentId: 7587176698924415,
              depth: 1,
              name: 'Fake child with not fetched children',
              subtreeSize: 2,
            },
          },
        ],
      },
    ];

    const modelMock = {
      allTreeIndexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      ownCheckedNodes: new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),

      async showNodeByTreeIndex(treeIndex, applyToChildren) {
        if (applyToChildren) {
          const { subtreeSize } = getNodeByTreeIndex(treeData, treeIndex).meta;
          for (let i = treeIndex; i < treeIndex + subtreeSize; i++) {
            modelMock.ownCheckedNodes.add(i);
          }
        } else {
          modelMock.ownCheckedNodes.add(treeIndex);
        }
      },
      async hideNodeByTreeIndex(treeIndex, _, applyToChildren) {
        if (applyToChildren) {
          const { subtreeSize } = getNodeByTreeIndex(treeData, treeIndex).meta;
          for (let i = treeIndex; i < treeIndex + subtreeSize; i++) {
            modelMock.ownCheckedNodes.delete(i);
          }
        } else {
          modelMock.ownCheckedNodes.delete(treeIndex);
        }
      },
      async hideAllNodes() {
        modelMock.ownCheckedNodes.clear();
      },
      async showAllNodes() {
        modelMock.ownCheckedNodes = new Set(modelMock.allTreeIndexes);
      },
    };

    // start with all checked
    const { rerender } = render(
      <TestComponent
        model={modelMock}
        treeData={treeData}
        checkedKeys={[0, 1, 2, 3, 4, 5, 6, 7, 8]}
      />
    );

    await sleep(300);

    expect([...modelMock.ownCheckedNodes].sort()).toEqual(
      // eslint-disable-next-line prettier/prettier
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    );

    // uncheck one leaf [2]
    rerender(
      <TestComponent
        model={modelMock}
        treeData={treeData}
        checkedKeys={[1, 3, 4, 5, 6, 7, 8]}
      />
    );

    await sleep(300);

    expect([...modelMock.ownCheckedNodes].sort()).toEqual(
      // eslint-disable-next-line prettier/prettier
      [1, 3, 4, 5, 6, 7, 8, 9]
    );

    // uncheck all
    rerender(
      <TestComponent model={modelMock} treeData={treeData} checkedKeys={[]} />
    );

    await sleep(300);

    expect([...modelMock.ownCheckedNodes].sort()).toEqual([]);

    // check a child with children [3]
    rerender(
      <TestComponent
        model={modelMock}
        treeData={treeData}
        checkedKeys={[3, 4, 5, 6, 7]}
      />
    );

    await sleep(300);

    expect([...modelMock.ownCheckedNodes].sort()).toEqual([3, 4, 5, 6, 7]);

    // check all [0]
    rerender(
      <TestComponent
        model={modelMock}
        treeData={treeData}
        checkedKeys={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
      />
    );

    await sleep(300);

    expect([...modelMock.ownCheckedNodes].sort()).toEqual(
      // eslint-disable-next-line prettier/prettier
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    );
  });
});
