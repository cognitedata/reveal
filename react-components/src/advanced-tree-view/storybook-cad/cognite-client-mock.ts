/*!
 * Copyright 2025 Cognite AS
 */
import type { List3DNodesQuery, Node3D } from '@cognite/sdk';

import { CadTreeNode } from './cad-tree-node';
import { type ICogniteClient } from './i-cognite-client';

const SLEEP_DURATION = 200;

export class CogniteClientMock implements ICogniteClient {
  public async list3DNodes(
    _modelId: number,
    _revisionId: number,
    query: List3DNodesQuery
  ): Promise<{ items: Node3D[]; nextCursor?: string }> {
    await sleep(SLEEP_DURATION);
    const nodeId = query.nodeId;
    const prevCursor = query.cursor;
    if (nodeId === undefined) {
      return { items: [getNode3D(TREE)] };
    }
    const parent = TREE.getThisOrDescendantByNodeId(nodeId);
    const nodes: Node3D[] = [];
    let nextCursor: string | undefined;
    if (parent === undefined) {
      nodes.push(getNode3D(TREE));
    } else {
      let inside = prevCursor === undefined;
      for (const child of parent.getChildrenByType(CadTreeNode)) {
        if (!inside) {
          if (prevCursor === child.label) {
            inside = true; // Cursor found
          } else {
            continue;
          }
        }
        if (query.limit !== undefined && nodes.length >= query.limit) {
          nextCursor = child.label;
          break; // Limit reached
        }
        nodes.push(getNode3D(child));
      }
    }
    return { items: nodes, nextCursor };
  }

  public async list3DNodeAncestors(
    _modelId: number,
    _revisionId: number,
    nodeId: number
  ): Promise<{ items: Node3D[] }> {
    await sleep(SLEEP_DURATION);
    const node = TREE.getThisOrDescendantByNodeId(nodeId);
    if (node === undefined) {
      return { items: [] };
    }
    const nodes: Node3D[] = [];
    nodes.push(getNode3D(node));
    for (const ancestor of node.getAncestorsByType(CadTreeNode)) {
      nodes.push(getNode3D(ancestor));
    }
    nodes.reverse();
    return { items: nodes };
  }

  public getRandomNodeId(): number {
    // AAA
    const nodes = new Array<CadTreeNode>();
    for (const descendant of TREE.getThisAndDescendants()) {
      if (descendant instanceof CadTreeNode) {
        nodes.push(descendant);
      }
    }
    const index = getRandomIntByMax(nodes.length);
    return nodes[index].nodeId;
  }
}

const TREE = createTree();

function createTree(): CadTreeNode {
  let nodeId = 0;
  let treeIndex = 0;
  const root = createNode(nodeId++, treeIndex++);

  for (let i = 1; i <= 67; i++) {
    const parent = createNode(nodeId++, treeIndex++);
    root.addChild(parent);
    for (let j = 1; j <= 260; j++) {
      const child = createNode(nodeId++, treeIndex++);
      parent.addChild(child);
      for (let k = 1; k <= 145; k++) {
        const leaf = createNode(nodeId++, treeIndex++);
        child.addChild(leaf);
        for (let k = 1; k <= 2; k++) {
          const leafChild = createNode(nodeId++, treeIndex++);
          leaf.addChild(leafChild);
        }
      }
    }
  }
  return root;

  function createNode(id: number, treeIndex: number): CadTreeNode {
    return new CadTreeNode({
      id,
      name: 'Cad node ' + id,
      treeIndex,
      subtreeSize: -1 // No not need this value
    });
  }
}

function getRandomIntByMax(max: number): number {
  return Math.floor(Math.random() * max);
}

export async function sleep(durationInMs: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, durationInMs));
}

function getNode3D(node: CadTreeNode): Node3D {
  return {
    id: node.nodeId,
    treeIndex: node.treeIndex,
    subtreeSize: getSubTreeSize(node),
    name: node.label,
    parentId: getParentId(node),
    depth: getDepth(node)
  };

  function getSubTreeSize(node: CadTreeNode): number {
    let subtreeSize = 1;
    for (const _ancestor of node.getDescendants()) {
      subtreeSize++;
    }
    return subtreeSize;
  }

  function getDepth(node: CadTreeNode): number {
    let depth = 0;
    for (const _ancestor of node.getAncestors()) {
      depth++;
    }
    return depth;
  }

  function getParentId(node: CadTreeNode): number {
    if (node.parent instanceof CadTreeNode) {
      const parent = node.parent;
      return parent.nodeId;
    }
    return -1;
  }
}
