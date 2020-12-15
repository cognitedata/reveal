import { DataNode } from 'antd-v4/lib/tree';
import {
  addChildrenIntoTree,
  BasicTree,
  getNodeByTreeIndex,
  hasBranch,
  removeNodeFromTree,
  updateNodeById,
} from 'src/pages/RevisionDetails/components/TreeView/utils/treeFunctions';

describe('treeFunctions test cases', () => {
  describe('hasBranch', () => {
    it('returns `true` if every branch key is on the same level in the tree', () => {
      const treeData: DataNode[] = [
        {
          key: 1,
          children: [{ key: 2 }, { key: 4, children: [{ key: 5 }] }],
        },
      ];
      expect(hasBranch(treeData, [1, 4, 5])).toBe(true);
      expect(hasBranch(treeData, [1, 4])).toBe(true);
      expect(hasBranch(treeData, [1])).toBe(true);
      expect(hasBranch(treeData, [1, 2])).toBe(true);
    });

    it('returns `false` if NOT every branch key is on the same level in the tree', () => {
      const treeData: DataNode[] = [
        {
          key: 1,
          children: [{ key: 2 }, { key: 4, children: [{ key: 5 }] }],
        },
      ];
      expect(hasBranch(treeData, [0, 1, 4, 5])).toBe(false);
      expect(hasBranch(treeData, [1, 5])).toBe(false);
      expect(hasBranch(treeData, [2])).toBe(false);
      expect(hasBranch(treeData, [1, 2, 3])).toBe(false);
      expect(hasBranch([], [1, 2, 3])).toBe(false);
      expect(hasBranch([], [1])).toBe(false);
    });

    it('throws if branchKeys is an empty array', () => {
      expect(() => hasBranch([{ key: 1 }], [])).toThrow();
    });
  });

  describe('getNodeByTreeIndex', () => {
    it('returns found node', () => {
      const key = 100500;
      const subtreeToFind = { key, children: [{ key: 4 }] };
      const treeData: DataNode[] = [
        {
          key: 1,
          children: [{ key: 2 }, subtreeToFind],
        },
      ];
      expect(getNodeByTreeIndex(treeData, key)).toEqual(subtreeToFind);
      expect(getNodeByTreeIndex([subtreeToFind], key)).toBe(subtreeToFind);
    });

    it('returns undefined if not found', () => {
      const key = 100500;
      const treeData: DataNode[] = [
        {
          key: 1,
          children: [{ key: 2 }],
        },
      ];
      expect(getNodeByTreeIndex(treeData, key)).toBeUndefined();
      expect(getNodeByTreeIndex([], key)).toBeUndefined();
    });
  });

  describe('addChildrenIntoTree', () => {
    it('initial state', () => {
      const treeData: BasicTree[] = [];
      const newTreeData: BasicTree[] = [
        {
          key: 1,
          title: '',
          children: [
            { key: 2, title: '' },
            { key: 3, title: '', children: [{ key: 4, title: '' }] },
          ],
        },
      ];

      expect(addChildrenIntoTree(treeData, undefined, newTreeData)).toEqual(
        newTreeData
      );
    });

    it('find child and create its children', () => {
      const subtreeRootId = 2;
      const treeData: BasicTree[] = [
        {
          key: 1,
          title: '',
          children: [{ key: subtreeRootId, title: '' }],
        },
      ];
      const newTreeData: BasicTree[] = [
        {
          key: 3,
          title: '',
          children: [{ key: 4, title: '' }],
        },
      ];

      expect(addChildrenIntoTree(treeData, subtreeRootId, newTreeData)).toEqual(
        [
          {
            key: 1,
            title: '',
            children: [
              {
                key: subtreeRootId,
                title: '',
                children: [
                  { key: 3, title: '', children: [{ key: 4, title: '' }] },
                ],
              },
            ],
          },
        ]
      );
    });

    it('inserts only unique children', () => {
      const subtreeRootId = 1;
      const treeData: BasicTree[] = [
        {
          key: subtreeRootId,
          title: '',
          children: [
            { key: 2, title: '' },
            { key: 3, title: '', children: [{ key: 4, title: '' }] },
          ],
        },
      ];
      const newTreeData: BasicTree[] = [
        {
          key: 3,
          title: '',
          children: [{ key: 4, title: 'that will be ignored' }],
        },
        { key: 5, title: '', children: [{ key: 6, title: '' }] },
        { key: 7, title: '' },
      ];
      expect(addChildrenIntoTree(treeData, subtreeRootId, newTreeData)).toEqual(
        [
          {
            key: subtreeRootId,
            title: '',
            children: [
              { key: 2, title: '' },
              { key: 3, title: '', children: [{ key: 4, title: '' }] },
              { key: 5, title: '', children: [{ key: 6, title: '' }] },
              { key: 7, title: '' },
            ],
          },
        ]
      );
    });

    it('keeps result sorted by title', () => {
      const subtreeRootId = 1;

      const expectedChildren = [
        { key: 4444, title: '1' },
        { key: 55555, title: '2' },
        { key: 88888888, title: 'A' },
        { key: 666666, title: 'B' },
        { key: 15, title: 'C' },

        { key: 10, title: 'D' },
        { key: 11, title: 'E' },
        { key: 7777777, title: 'd' },
        { key: 12, title: 'e' },
        { key: 999999999, title: 'f' },

        { key: 22, title: 'g' },
      ];

      const treeData: BasicTree[] = [
        {
          key: subtreeRootId,
          title: '',
          children: [
            expectedChildren[0],
            expectedChildren[1],
            expectedChildren[4],
            expectedChildren[6],
            expectedChildren[8],
            expectedChildren[10],
          ],
        },
      ];

      const newTreeData: BasicTree[] = [
        expectedChildren[0],
        expectedChildren[2],
        expectedChildren[3],
        expectedChildren[5],
        expectedChildren[7],
        expectedChildren[9],
        expectedChildren[10],
      ];

      expect(addChildrenIntoTree(treeData, subtreeRootId, newTreeData)).toEqual(
        [
          {
            key: subtreeRootId,
            title: '',
            children: expectedChildren,
          },
        ]
      );
    });

    it('concat children to the root', () => {
      const treeData: BasicTree[] = [
        {
          key: 1,
          title: '',
          children: [
            { key: 2, title: '' },
            { key: 3, title: '', children: [{ key: 4, title: '' }] },
          ],
        },
      ];
      const newTreeData: BasicTree[] = [
        {
          key: 5,
          title: '',
          children: [
            { key: 6, title: '' },
            { key: 7, title: '', children: [{ key: 8, title: '' }] },
          ],
        },
      ];

      expect(addChildrenIntoTree(treeData, undefined, newTreeData)).toEqual([
        {
          key: 1,
          title: '',
          children: [
            { key: 2, title: '' },
            { key: 3, title: '', children: [{ key: 4, title: '' }] },
          ],
        },
        {
          key: 5,
          title: '',
          children: [
            { key: 6, title: '' },
            { key: 7, title: '', children: [{ key: 8, title: '' }] },
          ],
        },
      ]);
    });

    it('concat children to the child', () => {
      const subtreeRootId = 3;
      const treeData: BasicTree[] = [
        {
          key: 1,
          title: '',
          children: [
            { key: 2, title: '' },
            {
              key: subtreeRootId,
              title: '',
              children: [{ key: 4, title: '' }],
            },
          ],
        },
      ];
      const newTreeData: BasicTree[] = [
        {
          key: 5,
          title: '',
          children: [
            { key: 6, title: '' },
            { key: 7, title: '', children: [{ key: 8, title: '' }] },
          ],
        },
      ];
      expect(addChildrenIntoTree(treeData, subtreeRootId, newTreeData)).toEqual(
        [
          {
            key: 1,
            title: '',
            children: [
              { key: 2, title: '' },
              {
                key: subtreeRootId,
                title: '',
                children: [
                  { key: 4, title: '' },
                  {
                    key: 5,
                    title: '',
                    children: [
                      { key: 6, title: '' },
                      { key: 7, title: '', children: [{ key: 8, title: '' }] },
                    ],
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
      const treeData = [
        {
          key: 1,
          title: '',
          children: [
            { key: 2, title: '' },
            { key: 3, title: '', children: [{ key: 4, title: '' }] },
          ],
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
          title: '',
          children: [
            { key: 2, title: '' },
            { key: 3, title: '', children: [{ key: 4, title: '' }] },
          ],
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
      const treeData = [
        {
          key: 1,
          title: '',
          children: [
            { key: 2, title: '' },
            {
              key: 3,
              title: '',
              children: [
                { key: nodeIdToUpdate, title: 'foo', disabled: false },
                { key: 4, title: '' },
              ],
            },
          ],
        },
        {
          key: 5,
          title: '',
        },
      ];
      expect(
        updateNodeById(treeData, nodeIdToUpdate, { title: 'bar' })
      ).toEqual([
        {
          key: 1,
          title: '',
          children: [
            { key: 2, title: '' },
            {
              key: 3,
              title: '',
              children: [
                { key: nodeIdToUpdate, title: 'bar', disabled: false },
                { key: 4, title: '' },
              ],
            },
          ],
        },
        {
          key: 5,
          title: '',
        },
      ]);
    });
  });
});
