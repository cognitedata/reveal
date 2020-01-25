/*!
 * Copyright 2020 Cognite AS
 */

import { traverseDepthFirst, traverseUpwards } from '../../utils/traversal';

describe('traversal', () => {
  type Element = {
    id: number;
    children: Element[];
  };

  test(`traverseDepthFirst traverses in correct order`, async () => {
    // Arrange
    const root = {
      id: 0,
      children: [
        {
          id: 1,
          children: [{ id: 2, children: [] }]
        },
        {
          id: 3,
          children: [{ id: 4, children: [{ id: 5, children: [] }] }]
        }
      ]
    };
    const visitedOrder: number[] = [];
    const visitor = (element: Element) => {
      visitedOrder.push(element.id);
      return true;
    };

    // Act
    traverseDepthFirst(root, visitor);

    // Assert
    expect(visitedOrder.join(',')).toBe([0, 1, 2, 3, 4, 5].join(','));
  });

  test(`traverseDepthFirst with cutoff, skips processing and traverses sistes`, async () => {
    // Arrange
    const root = {
      id: 0,
      children: [
        {
          id: 1,
          children: [{ id: 2, children: [] }]
        },
        {
          id: 3,
          // The following subtree is skipped
          children: [{ id: 4, children: [{ id: 5, children: [] }] }]
        },
        {
          id: 6,
          children: [{ id: 7, children: [] }]
        }
      ]
    };
    const visitedOrder: number[] = [];
    const visitor = (element: Element) => {
      visitedOrder.push(element.id);
      return element.id !== 3;
    };

    // Act
    traverseDepthFirst(root, visitor);

    // Assert
    expect(visitedOrder.join(',')).toBe([0, 1, 2, 3, 6, 7].join(','));
  });

  interface WithParentNode {
    readonly id: number;
    readonly parent?: WithParentNode;
  }

  test('traverseUpwards', () => {
    // Arrange
    const leaf: WithParentNode = {
      id: 5,
      parent: {
        id: 4,
        parent: {
          id: 3
        } as WithParentNode
      } as WithParentNode
    };
    const visitedOrder: number[] = [];
    const visitor = (element: WithParentNode) => {
      visitedOrder.push(element.id);
      return element.id !== 3;
    };

    // Act
    traverseUpwards(leaf, visitor);

    // Assert
    expect(visitedOrder.join(',')).toBe([5, 4, 3].join(','));
  });
});
