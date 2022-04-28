import { KeypointVertex } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { getDummyAnnotation } from 'src/__test-utils/annotations';
import { Categories } from 'src/modules/Review/types';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import {
  AnnotationReviewCallbacks,
  Category,
  CommonProps,
  Data,
  ReviewAnnotation,
  RowData,
  TreeNode,
} from 'src/modules/Review/Components/AnnotationReviewDetailComponents/types';
import {
  getActiveNode,
  getActiveNodeIndexFromArray,
  getActiveNodeParent,
  getActiveNodeSiblings,
  getNodeFromRowSelect,
  isAnnotationData,
  isCategoryData,
  isKeypointAnnotationData,
  selectNextOrFirstIndexArr,
  selectPrevOrFirstIndexArr,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/utils/nodeTreeUtils';

const getDummyDataObject = (
  data: Category | ReviewAnnotation | KeypointVertex
): Data => {
  return {
    ...data,
    common: {} as CommonProps,
    callbacks: {} as AnnotationReviewCallbacks,
  };
};

const getDummyReviewAnnotation = (id: number, selected = false) => {
  return {
    show: true,
    selected,
    ...getDummyAnnotation(1),
  };
};
const getDummyKeypointAnnotation = (id: number, selected = false) => {
  return {
    show: true,
    selected,
    ...getDummyAnnotation(1, VisionDetectionModelType.ObjectDetection, {
      data: { keypoint: true },
    }),
  };
};

const getDummyCategory = (title: Categories, selected = false): Category => {
  return { title, selected, emptyPlaceholder: 'empty' };
};

describe('test isCategoryData', () => {
  it('should reject empty', () => {
    expect(isCategoryData({} as RowData<Category>)).toEqual(false);
  });
  it('should reject other objects data', () => {
    expect(
      isCategoryData(getDummyDataObject(getDummyReviewAnnotation(1, false)))
    ).toEqual(false);
    expect(
      isCategoryData(getDummyDataObject(getDummyKeypointAnnotation(2)))
    ).toEqual(false);
  });
  it('should accept category data', () => {
    expect(
      isCategoryData(getDummyDataObject(getDummyCategory(Categories.Asset)))
    ).toEqual(true);
  });
});

describe('test isAnnotationData', () => {
  it('should reject empty', () => {
    expect(isAnnotationData({} as RowData<ReviewAnnotation>)).toEqual(false);
  });
  it('should reject other objects data', () => {
    expect(
      isAnnotationData(
        getDummyDataObject(getDummyCategory(Categories.Asset, false))
      )
    ).toEqual(false);
  });
  it('should accept annotation data', () => {
    expect(
      isAnnotationData(getDummyDataObject(getDummyReviewAnnotation(1, false)))
    ).toEqual(true);
    expect(
      isAnnotationData(getDummyDataObject(getDummyKeypointAnnotation(2)))
    ).toEqual(true);
  });
});

describe('test isKeypointAnnotationData', () => {
  it('should reject empty', () => {
    expect(isKeypointAnnotationData({} as RowData<ReviewAnnotation>)).toEqual(
      false
    );
  });
  it('should reject other objects data', () => {
    expect(
      isKeypointAnnotationData(
        getDummyDataObject(getDummyCategory(Categories.Asset, false))
      )
    ).toEqual(false);
    expect(
      isKeypointAnnotationData(getDummyDataObject(getDummyReviewAnnotation(1)))
    ).toEqual(false);
  });
  it('should accept keypoint vertex data', () => {
    expect(
      isKeypointAnnotationData(
        getDummyDataObject(getDummyKeypointAnnotation(1))
      )
    ).toEqual(true);
  });
});

const getDummyTreeNode = (
  id: string,
  isOpen = false,
  data?: Category | KeypointVertex | ReviewAnnotation
): TreeNode<Data> => {
  return {
    id,
    children: [],
    openByDefault: isOpen,
    additionalData: { common: {}, callbacks: {}, ...data } as RowData<Data>,
    component: () => null,
    name: id,
  };
};

describe('test nodeTree utility functions', () => {
  const treeNodesWithNoActiveNode: TreeNode<Data>[] = [
    {
      ...getDummyTreeNode('1'),
      children: [getDummyTreeNode('3'), getDummyTreeNode('4')],
    },
    { ...getDummyTreeNode('2') },
  ];
  const treeNodesWithOneActiveNode: TreeNode<Data>[] = [
    {
      ...getDummyTreeNode('1', true),
      children: [
        getDummyTreeNode('3'),
        getDummyTreeNode('4'),
        getDummyTreeNode('5', true),
      ],
    },
    { ...getDummyTreeNode('2') },
    { ...getDummyTreeNode('6') },
  ];
  describe('test getActiveNode', () => {
    it('should return undefined on empty', () => {
      expect(getActiveNode([])).toEqual(undefined);
    });
    it('should return undefined on no active node', () => {
      expect(getActiveNode(treeNodesWithNoActiveNode)).toEqual(undefined);
    });
    it('should return active node', () => {
      expect(getActiveNode(treeNodesWithOneActiveNode)?.id).toEqual('5');
    });
  });

  describe('test getActiveNodeIndexFromArray', () => {
    it('should return undefined on empty', () => {
      expect(getActiveNodeIndexFromArray([])).toEqual(undefined);
    });
    it('should return undefined on no active node', () => {
      expect(getActiveNodeIndexFromArray(treeNodesWithNoActiveNode)).toEqual(
        undefined
      );
    });
    it('should return active node', () => {
      expect(getActiveNodeIndexFromArray(treeNodesWithOneActiveNode)).toEqual(
        0
      );
    });
  });
  describe('test getActiveNodeSiblings', () => {
    it('should return undefined on empty', () => {
      expect(getActiveNodeSiblings([])).toEqual([]);
    });
    it('should return empty array on no active node', () => {
      expect(getActiveNodeSiblings(treeNodesWithNoActiveNode)).toEqual([]);
    });
    it('should return active node', () => {
      expect(
        getActiveNodeSiblings(treeNodesWithOneActiveNode).map((node) => node.id)
      ).toEqual(['3', '4', '5']);
    });
  });

  describe('test getActiveNodeParent', () => {
    it('should return undefined on empty', () => {
      expect(getActiveNodeParent([])).toEqual(undefined);
    });
    it('should return empty array on no active node', () => {
      expect(getActiveNodeParent(treeNodesWithNoActiveNode)).toEqual(undefined);
    });
    it('should return active node', () => {
      expect(getActiveNodeParent(treeNodesWithOneActiveNode)?.id).toEqual('1');
    });
  });

  describe('test getNodeFromRowSelect', () => {
    const getPreviousRowIndex = (
      rows: TreeNode<Data>[],
      currentActiveRowIndex: number | undefined
    ) => {
      if (!rows.length) {
        return null;
      }
      if (currentActiveRowIndex !== undefined) {
        const prevIndex = currentActiveRowIndex - 1;
        if (prevIndex < 0) {
          return rows.length + prevIndex;
        }
        return prevIndex;
      }
      return 0;
    };

    const getNextRowIndex = (
      rows: TreeNode<Data>[],
      currentActiveRowIndex: number | undefined
    ) => {
      if (!rows.length) {
        return null;
      }
      if (currentActiveRowIndex !== undefined) {
        const nextIndex = currentActiveRowIndex + 1;

        if (nextIndex < rows.length) {
          return nextIndex;
        }
        return nextIndex - rows.length;
      }
      return 0;
    };
    const onFirstElement = () => {
      return 0;
    };

    const onNull = () => {
      return null;
    };

    const onOutOfArrayBounds = () => {
      return 1000;
    };

    const onUndefined = () => {
      return 1000;
    };

    test('on Empty array', () => {
      expect(getNodeFromRowSelect([], onFirstElement)).toEqual(null);
    });
    test('on no active node', () => {
      expect(
        getNodeFromRowSelect(treeNodesWithNoActiveNode, getPreviousRowIndex)?.id
      ).toEqual('1');
    });
    it('should extract previous id of active node', () => {
      expect(
        getNodeFromRowSelect(treeNodesWithOneActiveNode, getPreviousRowIndex)
          ?.id
      ).toEqual('4');
    });
    it('should extract next id of active node', () => {
      expect(
        getNodeFromRowSelect(treeNodesWithOneActiveNode, getNextRowIndex)?.id
      ).toEqual('3');
    });
    it('should correctly provide first element', () => {
      expect(
        getNodeFromRowSelect(treeNodesWithOneActiveNode, onFirstElement)?.id
      ).toEqual('3');
    });
    it('should handle null, undefined, out of bound indexes', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      expect(
        getNodeFromRowSelect(treeNodesWithOneActiveNode, onNull)?.id
      ).toEqual(undefined);
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(
        getNodeFromRowSelect(treeNodesWithOneActiveNode, onOutOfArrayBounds)?.id
      ).toEqual(undefined);
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(
        getNodeFromRowSelect(treeNodesWithOneActiveNode, onUndefined)?.id
      ).toEqual(undefined);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('test selectNextOrFirstIndexArr', () => {
    it('should return null when array length is invalid', () => {
      expect(selectNextOrFirstIndexArr(undefined, undefined)).toEqual(null);
      expect(selectNextOrFirstIndexArr(0, undefined)).toEqual(null);
      expect(selectNextOrFirstIndexArr(0, 0)).toEqual(null);
      expect(selectNextOrFirstIndexArr(0, -1)).toEqual(null);
      expect(selectNextOrFirstIndexArr(0, 1.5)).toEqual(null);
      expect(selectNextOrFirstIndexArr(0, undefined)).toEqual(null);
    });
    it('should return 0 if no current active index is given', () => {
      expect(selectNextOrFirstIndexArr(undefined, 1)).toEqual(0);
      expect(selectNextOrFirstIndexArr(-1, 1)).toEqual(0);
      expect(selectNextOrFirstIndexArr(1.5, 1)).toEqual(0);
    });
    it('should return correct index', () => {
      expect(selectNextOrFirstIndexArr(0, 1)).toEqual(0);
      expect(selectNextOrFirstIndexArr(1, 2)).toEqual(0);
      expect(selectNextOrFirstIndexArr(1, 3)).toEqual(2);
    });
  });

  describe('test selectPrevOrFirstIndexArr', () => {
    it('should return null when array length is invalid', () => {
      expect(selectPrevOrFirstIndexArr(undefined, undefined)).toEqual(null);
      expect(selectPrevOrFirstIndexArr(0, undefined)).toEqual(null);
      expect(selectPrevOrFirstIndexArr(0, 0)).toEqual(null);
      expect(selectPrevOrFirstIndexArr(0, -1)).toEqual(null);
      expect(selectPrevOrFirstIndexArr(0, 1.5)).toEqual(null);
      expect(selectPrevOrFirstIndexArr(0, undefined)).toEqual(null);
    });
    it('should return 0 if no current active index is invalid', () => {
      expect(selectPrevOrFirstIndexArr(undefined, 1)).toEqual(0);
      expect(selectPrevOrFirstIndexArr(-1, 1)).toEqual(0);
      expect(selectPrevOrFirstIndexArr(1.5, 1)).toEqual(0);
    });
    it('should return correct index', () => {
      expect(selectPrevOrFirstIndexArr(0, 1)).toEqual(0);
      expect(selectPrevOrFirstIndexArr(0, 2)).toEqual(1);
      expect(selectPrevOrFirstIndexArr(1, 3)).toEqual(0);
    });
  });
});
