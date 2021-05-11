/*!
 * Copyright 2021 Cognite AS
 */
import { assertNever } from '../../../utilities';
import { IndexSet } from '../../../utilities/NewIndexSet';
import { NodeSet } from './NodeSet';

export type CombineNodeSetOperator = 'intersection' | 'union';

export class CombinedNodeSet extends NodeSet {
  private _nodeSets: NodeSet[] = [];
  private _operator: CombineNodeSetOperator;
  private _changedUnderlyingNodeSetHandler: () => void;
  private _cachedCombinedSet: IndexSet | undefined = undefined;

  constructor(combinationOperator: CombineNodeSetOperator, nodeSets?: NodeSet[]) {
    super();

    this._changedUnderlyingNodeSetHandler = this.makeDirty.bind(this);
    this._operator = combinationOperator;
    if (nodeSets) {
      nodeSets.forEach(x => this.addSet(x));
    }
  }

  addSet(nodeSet: NodeSet) {
    nodeSet.on('changed', this._changedUnderlyingNodeSetHandler);
    this._nodeSets.push(nodeSet);
    this.makeDirty();
  }

  removeSet(nodeSet: NodeSet) {
    const index = this._nodeSets.indexOf(nodeSet);
    if (index < 0) {
      throw new Error('Could not find set');
    }

    nodeSet.off('changed', this._changedUnderlyingNodeSetHandler);
    this._nodeSets.splice(index, 1);
    this.makeDirty();
  }

  private makeDirty(): void {
    if (this._cachedCombinedSet !== undefined) {
      this._cachedCombinedSet = undefined;
      this.notifyChanged();
    }
  }

  /**
   * @override
   */
  getIndexSet(): IndexSet {
    if (this._cachedCombinedSet === undefined) {
      this._cachedCombinedSet = this.createCachedCombinedSet();
    }
    return this._cachedCombinedSet;
  }

  /**
   * @override
   */
  get isLoading(): boolean {
    return this._nodeSets.some(x => x.isLoading);
  }

  private createCachedCombinedSet(): IndexSet {
    switch (this._operator) {
      case 'intersection':
        return this.createIntersectionSet();

      case 'union':
        return this.createUnionSet();

      default:
        assertNever(this._operator);
    }
  }

  private createIntersectionSet(): IndexSet {
    if (this._nodeSets.length === 0) {
      return new IndexSet();
    }
    const set = this._nodeSets[0].getIndexSet().clone();
    this._nodeSets.slice(1).forEach(x => set.intersectWith(x.getIndexSet()));
    return set;
  }

  private createUnionSet(): IndexSet {
    if (this._nodeSets.length === 0) {
      return new IndexSet();
    }
    const set = this._nodeSets[0].getIndexSet().clone();
    this._nodeSets.slice(1).forEach(x => set.unionWith(x.getIndexSet()));
    return set;
  }
}
