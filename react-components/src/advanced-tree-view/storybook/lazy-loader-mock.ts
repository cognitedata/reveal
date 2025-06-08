import { type ILazyLoader } from '../model/i-lazy-loader';
import { TreeNode } from '../model/tree-node';
import { type TreeNodeType } from '../model/tree-node-type';
import { CheckboxState } from '../model/types';

import { getRandomColor } from './create-simple-mock';

/**
 * Creates a mock tree structure for testing purposes.
 *
 * @param lazyLoading - A boolean indicating whether child nodes should be lazily loaded.
 * @returns A TreeNode representing the root of the mock tree.
 */

export class LazyLoaderMock implements ILazyLoader {
  private readonly _lazyLoading: boolean;
  private readonly _withStyling: boolean;
  private readonly _childrenCount: number;

  constructor(lazyLoading: boolean, withStyling: boolean, childrenCount: number) {
    this._lazyLoading = lazyLoading;
    this._withStyling = withStyling;
    this._childrenCount = childrenCount;
  }

  root: TreeNodeType | undefined;
  public async loadInitialRoot(): Promise<TreeNodeType> {
    if (this.root !== undefined) {
      return this.root;
    }
    const childrenCount = this._childrenCount;
    const lazyLoading = this._lazyLoading;

    const root = new TreeNode();
    root.label = 'Root';
    root.isExpanded = true;
    root.icon = 'Snow';

    for (let i = 1; i <= childrenCount; i++) {
      const parent = new TreeNode();
      parent.label = 'Folder ' + i;
      parent.isExpanded = childrenCount < 20;
      parent.icon = 'Folder';
      root.addChild(parent);

      for (let j = 1; j <= childrenCount; j++) {
        const child = new TreeNode();
        child.label = 'Child ' + i + '.' + j;
        child.icon = 'Copy';
        child.needLoadChildren = lazyLoading;
        parent.addChild(child);
        if (lazyLoading) {
          continue;
        }
        for (let k = 1; k <= childrenCount; k++) {
          const leaf = new TreeNode();
          leaf.label = 'Leaf ' + i + '.' + j + '.' + k;
          leaf.icon = 'Cube';
          leaf.needLoadChildren = lazyLoading;
          child.addChild(leaf);
        }
      }
    }
    if (this._withStyling) {
      for (const node of root.getThisAndDescendants()) {
        setRandomStyling(node);
      }
    }
    this.root = root;
    return root;
  }

  public async loadChildren(parent: TreeNodeType): Promise<TreeNodeType[] | undefined> {
    return await this.loadNodes_(parent, true);
  }

  public async loadSiblings(sibling: TreeNodeType): Promise<TreeNodeType[] | undefined> {
    return await this.loadNodes_(sibling, false);
  }

  private async loadNodes_(
    _node: TreeNodeType,
    _loadChildren: boolean
  ): Promise<TreeNodeType[] | undefined> {
    if (!this._lazyLoading) {
      return undefined;
    }
    const name = 'Lazy ' + (_loadChildren ? 'Child ' : 'Sibling ');

    const promise = new Promise<TreeNodeType[]>((resolve) =>
      setTimeout(() => {
        const array: TreeNodeType[] = [];
        const totalCount = 123;
        const batchSize = 10;

        for (let i = 0; i < batchSize && i < totalCount; i++) {
          const child = new TreeNode();
          child.label = name + getRandomIntByMax(1000);
          child.icon = 'Cube';
          child.isExpanded = false;
          child.needLoadSiblings = i === batchSize - 1;

          if (this._withStyling) {
            setRandomStyling(child);
          }
          array.push(child);
        }
        resolve(array);
      }, 2000)
    );
    return await promise;
  }
}

function setRandomStyling(node: TreeNodeType): void {
  if (!(node instanceof TreeNode)) {
    return;
  }
  node.iconColor = getRandomColor();
  node.isCheckboxEnabled = Math.random() < 0.9;
  node.hasBoldLabel = Math.random() < 0.1;
  node.checkboxState = CheckboxState.None;
}

function getRandomIntByMax(max: number): number {
  return Math.floor(Math.random() * max);
}
