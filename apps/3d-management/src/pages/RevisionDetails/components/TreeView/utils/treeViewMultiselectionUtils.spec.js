import { traverseNodesKey } from 'src/pages/RevisionDetails/components/TreeView/utils/treeViewMultiselectionUtils';

describe('TreeViewMultiselectionUtils test cases', () => {
  describe('traverse', () => {
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

    it('traverse all the children', () => {
      const visitedTreeIndices = [];
      traverseNodesKey(tree, (key) => {
        visitedTreeIndices.push(key);
      });
      expect(visitedTreeIndices).toEqual([0, 1, 2, 3, 4]);
    });

    it('traverse and ignore specified branch', () => {
      const visitedTreeIndices = [];
      traverseNodesKey(tree, (key) => {
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
