import {
  getActiveNode,
  getActiveNodeIndexFromArray,
  getActiveNodeParent,
  getActiveNodeSiblings,
  getNodeFromRowSelect,
  isVisionReviewAnnotationRowData,
  isAnnotationTypeRowData,
  isVisionReviewImageKeypointRowData,
  selectNextOrFirstIndexArr,
  selectPrevOrFirstIndexArr,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/utils/nodeTreeUtils';
import {
  AnnotationDetailPanelReviewCallbacks,
  AnnotationDetailPanelAnnotationType,
  AnnotationDetailPanelCommonProps,
  AnnotationDetailPanelRowData,
  TreeNode,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/types';
import { VisionAnnotationDataType } from 'src/modules/Common/types';
import { getDummyImageObjectDetectionBoundingBoxAnnotation } from 'src/__test-utils/getDummyAnnotations';
import { getDummyReviewImageKeypointObject } from 'src/__test-utils/annotations';
import {
  ReviewKeypoint,
  VisionReviewAnnotation,
} from 'src/modules/Review/types';

const getDummyRowDataObject = (
  data:
    | AnnotationDetailPanelAnnotationType
    | VisionReviewAnnotation<VisionAnnotationDataType>
    | ReviewKeypoint
): AnnotationDetailPanelRowData => {
  return {
    ...data,
    common: {} as AnnotationDetailPanelCommonProps,
    callbacks: {} as AnnotationDetailPanelReviewCallbacks,
  };
};

const getDummyAnnotationTypeRowDataObject = (
  selected = false
): AnnotationDetailPanelAnnotationType => {
  return { title: 'Asset tags', selected, emptyPlaceholder: 'empty' };
};

const getDummyVisionReviewAnnotationRowDataObject = (
  id: number,
  selected = false
): VisionReviewAnnotation<VisionAnnotationDataType> => {
  return {
    show: true,
    selected,
    annotation: getDummyImageObjectDetectionBoundingBoxAnnotation({ id }),
    color: 'red',
  };
};

describe('test isAnnotationTypeRowData', () => {
  it('should reject empty', () => {
    expect(isAnnotationTypeRowData({} as AnnotationDetailPanelRowData)).toEqual(
      false
    );
  });
  it('should reject other objects than instances of AnnotationDetailPanelAnnotationType', () => {
    expect(
      isAnnotationTypeRowData(
        getDummyRowDataObject(
          getDummyVisionReviewAnnotationRowDataObject(1, false)
        )
      )
    ).toEqual(false);
    expect(
      isAnnotationTypeRowData(
        getDummyRowDataObject(getDummyReviewImageKeypointObject(2))
      )
    ).toEqual(false);
  });
  it('should accept AnnotationDetailPanelAnnotationType objects', () => {
    expect(
      isAnnotationTypeRowData(
        getDummyRowDataObject(getDummyAnnotationTypeRowDataObject())
      )
    ).toEqual(true);
  });
});

describe('test isVisionReviewAnnotationRowData', () => {
  it('should reject empty', () => {
    expect(
      isVisionReviewAnnotationRowData({} as AnnotationDetailPanelRowData)
    ).toEqual(false);
  });
  it('should reject other objects than instances of VisionReviewAnnotation', () => {
    expect(
      isVisionReviewAnnotationRowData(
        getDummyRowDataObject(getDummyAnnotationTypeRowDataObject(false))
      )
    ).toEqual(false);

    expect(
      isVisionReviewAnnotationRowData(
        getDummyRowDataObject(getDummyReviewImageKeypointObject(2))
      )
    ).toEqual(false);
  });
  it('should accept VisionReviewAnnotation objects', () => {
    expect(
      isVisionReviewAnnotationRowData(
        getDummyRowDataObject(
          getDummyVisionReviewAnnotationRowDataObject(1, false)
        )
      )
    ).toEqual(true);
  });
});

describe('test isVisionReviewImageKeypointRowData', () => {
  it('should reject empty', () => {
    expect(
      isVisionReviewImageKeypointRowData({} as AnnotationDetailPanelRowData)
    ).toEqual(false);
  });
  it('should reject other objects than instances of ReviewKeypoint', () => {
    expect(
      isVisionReviewImageKeypointRowData(
        getDummyRowDataObject(getDummyAnnotationTypeRowDataObject(false))
      )
    ).toEqual(false);
    expect(
      isVisionReviewImageKeypointRowData(
        getDummyRowDataObject(getDummyVisionReviewAnnotationRowDataObject(1))
      )
    ).toEqual(false);
  });
  it('should accept ReviewKeypoint objects', () => {
    expect(
      isVisionReviewImageKeypointRowData(
        getDummyRowDataObject(getDummyReviewImageKeypointObject(1))
      )
    ).toEqual(true);
  });
});

const getDummyTreeNode = (
  id: string,
  isOpen = false,
  data?:
    | AnnotationDetailPanelAnnotationType
    | ReviewKeypoint
    | VisionReviewAnnotation<VisionAnnotationDataType>
): TreeNode<AnnotationDetailPanelRowData> => {
  return {
    id,
    children: [],
    openByDefault: isOpen,
    additionalData: {
      common: {},
      callbacks: {},
      ...data,
    } as AnnotationDetailPanelRowData,
    component: () => null,
    name: id,
  };
};

describe('test nodeTree utility functions', () => {
  const treeNodesWithNoActiveNode: TreeNode<AnnotationDetailPanelRowData>[] = [
    {
      ...getDummyTreeNode('1'),
      children: [getDummyTreeNode('3'), getDummyTreeNode('4')],
    },
    { ...getDummyTreeNode('2') },
  ];
  const treeNodesWithOneActiveNode: TreeNode<AnnotationDetailPanelRowData>[] = [
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
      rows: TreeNode<AnnotationDetailPanelRowData>[],
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
      rows: TreeNode<AnnotationDetailPanelRowData>[],
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
