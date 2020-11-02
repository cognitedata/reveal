import { DataNode } from 'antd-v4/lib/tree';
import {
  addChildrenIntoTree,
  removeNodeFromTree,
  updateNodeById,
} from 'src/pages/RevisionDetails/components/TreeView/utils/treeFunctions';

describe('treeFunctions test cases', () => {
  describe('addChildrenIntoTree', () => {
    it('initial state', () => {
      const treeData: DataNode[] = [];
      const newTreeData: DataNode[] = [
        {
          key: 1,
          children: [{ key: 2 }, { key: 3, children: [{ key: 4 }] }],
        },
      ];

      expect(addChildrenIntoTree(treeData, undefined, newTreeData)).toEqual(
        newTreeData
      );
    });

    it('find child and create its children', () => {
      const subtreeRootId = 2;
      const treeData: DataNode[] = [
        {
          key: 1,
          children: [{ key: subtreeRootId }],
        },
      ];
      const newTreeData: DataNode[] = [
        {
          key: 3,
          children: [{ key: 4 }],
        },
      ];

      expect(addChildrenIntoTree(treeData, subtreeRootId, newTreeData)).toEqual(
        [
          {
            key: 1,
            children: [
              {
                key: subtreeRootId,
                children: [{ key: 3, children: [{ key: 4 }] }],
              },
            ],
          },
        ]
      );
    });

    it('concat children to the root', () => {
      const treeData: DataNode[] = [
        {
          key: 1,
          children: [{ key: 2 }, { key: 3, children: [{ key: 4 }] }],
        },
      ];
      const newTreeData: DataNode[] = [
        {
          key: 5,
          children: [{ key: 6 }, { key: 7, children: [{ key: 8 }] }],
        },
      ];

      expect(addChildrenIntoTree(treeData, undefined, newTreeData)).toEqual([
        {
          key: 1,
          children: [{ key: 2 }, { key: 3, children: [{ key: 4 }] }],
        },
        {
          key: 5,
          children: [{ key: 6 }, { key: 7, children: [{ key: 8 }] }],
        },
      ]);
    });

    it('concat children to the child', () => {
      const subtreeRootId = 3;
      const treeData: DataNode[] = [
        {
          key: 1,
          children: [
            { key: 2 },
            { key: subtreeRootId, children: [{ key: 4 }] },
          ],
        },
      ];
      const newTreeData: DataNode[] = [
        {
          key: 5,
          children: [{ key: 6 }, { key: 7, children: [{ key: 8 }] }],
        },
      ];
      expect(addChildrenIntoTree(treeData, subtreeRootId, newTreeData)).toEqual(
        [
          {
            key: 1,
            children: [
              { key: 2 },
              {
                key: subtreeRootId,
                children: [
                  { key: 4 },
                  {
                    key: 5,
                    children: [{ key: 6 }, { key: 7, children: [{ key: 8 }] }],
                  },
                ],
              },
            ],
          },
        ]
      );
    });
  });

  describe('removeNodeFromTree', () => {
    it('remove from root', () => {
      const nodeIdToRemove = 100500;
      const treeData: DataNode[] = [
        {
          key: 1,
          children: [{ key: 2 }, { key: 3, children: [{ key: 4 }] }],
        },
        {
          key: nodeIdToRemove,
        },
      ];
      expect(removeNodeFromTree(treeData, nodeIdToRemove)).toEqual([
        {
          key: 1,
          children: [{ key: 2 }, { key: 3, children: [{ key: 4 }] }],
        },
      ]);
    });

    it('remove from children', () => {
      const nodeIdToRemove = 100500;
      const treeData: DataNode[] = [
        {
          key: 1,
          children: [
            { key: 2 },
            { key: 3, children: [{ key: nodeIdToRemove }, { key: 4 }] },
          ],
        },
        {
          key: 5,
        },
      ];
      expect(removeNodeFromTree(treeData, nodeIdToRemove)).toEqual([
        {
          key: 1,
          children: [{ key: 2 }, { key: 3, children: [{ key: 4 }] }],
        },
        {
          key: 5,
        },
      ]);
    });
  });

  describe('updateNodeById', () => {
    it('updates root', () => {
      const nodeIdToUpdate = 100500;
      const treeData: DataNode[] = [
        {
          key: 1,
          children: [{ key: 2 }, { key: 3, children: [{ key: 4 }] }],
        },
        {
          key: nodeIdToUpdate,
          title: 'foo',
          disabled: false,
        },
      ];
      expect(
        updateNodeById(treeData, nodeIdToUpdate, { title: 'bar' })
      ).toEqual([
        {
          key: 1,
          children: [{ key: 2 }, { key: 3, children: [{ key: 4 }] }],
        },
        {
          key: nodeIdToUpdate,
          title: 'bar',
          disabled: false,
        },
      ]);
    });

    it('updates child', () => {
      const nodeIdToUpdate = 100500;
      const treeData: DataNode[] = [
        {
          key: 1,
          children: [
            { key: 2 },
            {
              key: 3,
              children: [
                { key: nodeIdToUpdate, title: 'foo', disabled: false },
                { key: 4 },
              ],
            },
          ],
        },
        {
          key: 5,
        },
      ];
      expect(
        updateNodeById(treeData, nodeIdToUpdate, { title: 'bar' })
      ).toEqual([
        {
          key: 1,
          children: [
            { key: 2 },
            {
              key: 3,
              children: [
                { key: nodeIdToUpdate, title: 'bar', disabled: false },
                { key: 4 },
              ],
            },
          ],
        },
        {
          key: 5,
        },
      ]);
    });
  });
});
