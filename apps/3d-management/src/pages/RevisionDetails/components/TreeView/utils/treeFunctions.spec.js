import {
  addChildrenIntoTree,
  getAncestors,
  getNodeByTreeIndex,
  hasBranch,
  removeNodeFromTree,
  traverseTree,
  updateNodeById,
} from 'pages/RevisionDetails/components/TreeView/utils/treeFunctions';

describe('treeFunctions test cases', () => {
  describe('hasBranch', () => {
    it('returns `true` if every branch key is on the same level in the tree', () => {
      const treeData = [
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
      const treeData = [
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
      const treeData = [
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
      const treeData = [
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
      const treeData = [];
      const newTreeData = [
        {
          key: 1,
          meta: { name: '' },
          children: [
            { key: 2, meta: { name: '' } },
            {
              key: 3,
              meta: { name: '' },
              children: [{ key: 4, meta: { name: '' } }],
            },
          ],
        },
      ];

      expect(addChildrenIntoTree(treeData, undefined, newTreeData)).toEqual(
        newTreeData
      );
    });

    it('find child and create its children', () => {
      const subtreeRootId = 2;
      const treeData = [
        {
          key: 1,
          meta: { name: '' },
          children: [{ key: subtreeRootId, meta: { name: '' } }],
        },
      ];
      const newTreeData = [
        {
          key: 3,
          meta: { name: '' },
          children: [{ key: 4, meta: { name: '' } }],
        },
      ];

      expect(addChildrenIntoTree(treeData, subtreeRootId, newTreeData)).toEqual(
        [
          {
            key: 1,
            meta: { name: '' },
            children: [
              {
                key: subtreeRootId,
                meta: { name: '' },
                children: [
                  {
                    key: 3,
                    meta: { name: '' },
                    children: [{ key: 4, meta: { name: '' } }],
                  },
                ],
              },
            ],
          },
        ]
      );
    });

    it('inserts only unique children', () => {
      const subtreeRootId = 1;
      const treeData = [
        {
          key: subtreeRootId,
          meta: { name: '' },
          children: [
            { key: 2, meta: { name: '' } },
            {
              key: 3,
              meta: { name: '' },
              children: [{ key: 4, meta: { name: '' } }],
            },
          ],
        },
      ];
      const newTreeData = [
        {
          key: 3,
          meta: { name: '' },
          children: [{ key: 4, title: 'that will be ignored' }],
        },
        {
          key: 5,
          meta: { name: '' },
          children: [{ key: 6, meta: { name: '' } }],
        },
        { key: 7, meta: { name: '' } },
      ];
      expect(addChildrenIntoTree(treeData, subtreeRootId, newTreeData)).toEqual(
        [
          {
            key: subtreeRootId,
            meta: { name: '' },
            children: [
              { key: 2, meta: { name: '' } },
              {
                key: 3,
                meta: { name: '' },
                children: [{ key: 4, meta: { name: '' } }],
              },
              {
                key: 5,
                meta: { name: '' },
                children: [{ key: 6, meta: { name: '' } }],
              },
              { key: 7, meta: { name: '' } },
            ],
          },
        ]
      );
    });

    it('keeps result sorted by meta.name', () => {
      const subtreeRootId = 1;

      const expectedChildren = [
        { key: 4444, meta: { name: '1' } },
        { key: 55555, meta: { name: '2' } },
        { key: 1111, meta: { name: '11' } },
        { key: 88888888, meta: { name: 'A' } },
        { key: 666666, meta: { name: 'B' } },
        { key: 15, meta: { name: 'C' } },

        { key: 10, meta: { name: 'D' } },
        { key: 7777777, meta: { name: 'd' } },

        { key: 11, meta: { name: 'E' } },
        { key: 12, meta: { name: 'e' } },
        { key: 999999999, meta: { name: 'f' } },
        { key: 22, meta: { name: 'g' } },
      ];

      const treeData = [
        {
          key: subtreeRootId,
          meta: { name: '' },
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

      // duplicates won't appear more than once
      const newTreeData = [
        expectedChildren[0],
        expectedChildren[2],
        expectedChildren[3],
        expectedChildren[5],
        expectedChildren[7],
        expectedChildren[9],
        expectedChildren[10],
        expectedChildren[11],
      ];

      expect(addChildrenIntoTree(treeData, subtreeRootId, newTreeData)).toEqual(
        [
          {
            key: subtreeRootId,
            meta: { name: '' },
            children: expectedChildren,
          },
        ]
      );
    });

    it('concat children to the root', () => {
      const treeData = [
        {
          key: 1,
          meta: { name: '' },
          children: [
            { key: 2, meta: { name: '' } },
            {
              key: 3,
              meta: { name: '' },
              children: [{ key: 4, meta: { name: '' } }],
            },
          ],
        },
      ];
      const newTreeData = [
        {
          key: 5,
          meta: { name: '' },
          children: [
            { key: 6, meta: { name: '' } },
            {
              key: 7,
              meta: { name: '' },
              children: [{ key: 8, meta: { name: '' } }],
            },
          ],
        },
      ];

      expect(addChildrenIntoTree(treeData, undefined, newTreeData)).toEqual([
        {
          key: 1,
          meta: { name: '' },
          children: [
            { key: 2, meta: { name: '' } },
            {
              key: 3,
              meta: { name: '' },
              children: [{ key: 4, meta: { name: '' } }],
            },
          ],
        },
        {
          key: 5,
          meta: { name: '' },
          children: [
            { key: 6, meta: { name: '' } },
            {
              key: 7,
              meta: { name: '' },
              children: [{ key: 8, meta: { name: '' } }],
            },
          ],
        },
      ]);
    });

    it('concat children to the child', () => {
      const subtreeRootId = 3;
      const treeData = [
        {
          key: 1,
          meta: { name: '' },
          children: [
            { key: 2, meta: { name: '' } },
            {
              key: subtreeRootId,
              meta: { name: '' },
              children: [{ key: 4, meta: { name: '' } }],
            },
          ],
        },
      ];
      const newTreeData = [
        {
          key: 5,
          meta: { name: '' },
          children: [
            { key: 6, meta: { name: '' } },
            {
              key: 7,
              meta: { name: '' },
              children: [{ key: 8, meta: { name: '' } }],
            },
          ],
        },
      ];
      expect(addChildrenIntoTree(treeData, subtreeRootId, newTreeData)).toEqual(
        [
          {
            key: 1,
            meta: { name: '' },
            children: [
              { key: 2, meta: { name: '' } },
              {
                key: subtreeRootId,
                meta: { name: '' },
                children: [
                  { key: 4, meta: { name: '' } },
                  {
                    key: 5,
                    meta: { name: '' },
                    children: [
                      { key: 6, meta: { name: '' } },
                      {
                        key: 7,
                        meta: { name: '' },
                        children: [{ key: 8, meta: { name: '' } }],
                      },
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
      const treeData = [
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
      const treeData = [
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
          meta: { name: '' },
          children: [
            { key: 2, meta: { name: '' } },
            {
              key: 3,
              meta: { name: '' },
              children: [{ key: 4, meta: { name: '' } }],
            },
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
          meta: { name: '' },
          children: [
            { key: 2, meta: { name: '' } },
            {
              key: 3,
              meta: { name: '' },
              children: [{ key: 4, meta: { name: '' } }],
            },
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
          meta: { name: '' },
          children: [
            { key: 2, meta: { name: '' } },
            {
              key: 3,
              meta: { name: '' },
              children: [
                { key: nodeIdToUpdate, title: 'foo', disabled: false },
                { key: 4, meta: { name: '' } },
              ],
            },
          ],
        },
        {
          key: 5,
          meta: { name: '' },
        },
      ];
      expect(
        updateNodeById(treeData, nodeIdToUpdate, { title: 'bar' })
      ).toEqual([
        {
          key: 1,
          meta: { name: '' },
          children: [
            { key: 2, meta: { name: '' } },
            {
              key: 3,
              meta: { name: '' },
              children: [
                { key: nodeIdToUpdate, title: 'bar', disabled: false },
                { key: 4, meta: { name: '' } },
              ],
            },
          ],
        },
        {
          key: 5,
          meta: { name: '' },
        },
      ]);
    });

    describe('getAncestors', () => {
      it('returns ancestors from root to node specified', () => {
        const keyToFind = 100500;
        const tree = [
          {
            key: 1,
            meta: { name: '' },
            children: [
              {
                key: 2,
                meta: { name: '' },
                children: [
                  { key: 3, meta: { name: '' }, children: [] },
                  { key: keyToFind, meta: { name: '' }, children: [] },
                  { key: 5, meta: { name: '' }, children: [] },
                ],
              },
              { key: 6, meta: { name: '' }, children: [] },
            ],
          },
        ];
        expect(getAncestors(tree, keyToFind)).toEqual([1, 2, keyToFind]);

        expect(getAncestors([{ key: 1, meta: { name: '' } }], 1)).toEqual([1]);
      });

      it('returns undefined when there is no such node in the tree', () => {
        const notExistingNode = 100500;
        const tree = [
          {
            key: 1,
            meta: { name: '' },
            children: [
              {
                key: 2,
                meta: { name: '' },
                children: [
                  { key: 3, meta: { name: '' }, children: [] },
                  { key: 5, meta: { name: '' }, children: [] },
                ],
              },
              { key: 6, meta: { name: '' }, children: [] },
            ],
          },
        ];
        expect(getAncestors(tree, notExistingNode)).toBeUndefined();
      });
    });
  });

  describe('traverseTree', () => {
    const tree = [
      {
        key: 0,
        title: '',
        children: [
          { key: 1, title: '', children: [{ key: 2, title: '' }] },
          { key: 3, title: '' },
        ],
      },
      { key: 4, title: '' },
    ];

    it('traverses all the children', () => {
      const visitedTreeIndices = [];
      traverseTree(tree, (key) => {
        visitedTreeIndices.push(key);
      });
      expect(visitedTreeIndices).toEqual([0, 1, 2, 3, 4]);
    });

    it('traverses and ignores specified branch', () => {
      const visitedTreeIndices = [];
      traverseTree(tree, (key) => {
        visitedTreeIndices.push(key);
        if (key === 1) {
          return false;
        }
        return true;
      });
      expect(visitedTreeIndices).toEqual([0, 1, /* 2 ignored */ 3, 4]);
    });
  });
});
