/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import { ListResponse, Node3D } from '@cognite/sdk';
import { PopulateIndexSetFromPagedResponseHelper } from './PopulateIndexSetFromPagedResponseHelper';
import { AreaCollection } from './prioritized/AreaCollection';
import { EmptyAreaCollection } from './prioritized/EmptyAreaCollection';
import { NodeCollection } from './NodeCollection';
import { CdfModelNodeCollectionDataProvider } from './CdfModelNodeCollectionDataProvider';
import { IndexSet, NumericRange, toThreeBox3 } from '@reveal/utilities';

export abstract class CdfNodeCollectionBase extends NodeCollection {
  private _indexSet = new IndexSet();
  private _areas: AreaCollection = EmptyAreaCollection.instance();

  private readonly _boundsMapper: CdfModelNodeCollectionDataProvider;
  private _fetchResultHelper: PopulateIndexSetFromPagedResponseHelper<Node3D> | undefined;

  constructor(classToken: string, model: CdfModelNodeCollectionDataProvider) {
    super(classToken);
    this._boundsMapper = model;
  }

  get isLoading(): boolean {
    return this._fetchResultHelper !== undefined && this._fetchResultHelper.isLoading;
  }

  protected async updateCollectionFromResults(requests: Promise<ListResponse<Node3D[]>>[]): Promise<void> {
    if (this._fetchResultHelper !== undefined) {
      // Interrupt any ongoing operation to avoid fetching results unnecessary
      this._fetchResultHelper.interrupt();
    }
    const fetchResultHelper = new PopulateIndexSetFromPagedResponseHelper<Node3D>(
      nodes => nodes.map(node => new NumericRange(node.treeIndex, node.subtreeSize)),
      async nodes =>
        nodes.map(node => {
          const bounds = new THREE.Box3();
          if (node.boundingBox !== undefined) {
            toThreeBox3(node.boundingBox, bounds);
            this._boundsMapper.mapBoxFromCdfToModelCoordinates(bounds, bounds);
          }
          return bounds;
        }),
      () => this.notifyChanged()
    );
    this._fetchResultHelper = fetchResultHelper;

    this._indexSet = fetchResultHelper.indexSet;
    this._areas = fetchResultHelper.areas;

    const pageOperations = requests.map(request => {
      return fetchResultHelper.pageResults(request);
    });

    this.notifyChanged();
    await Promise.all(pageOperations);
  }

  /**
   * Clears the node collection and interrupts any ongoing operations.
   */
  clear(): void {
    if (this._fetchResultHelper !== undefined) {
      this._fetchResultHelper.interrupt();
    }
    this._indexSet.clear();
    this.notifyChanged();
  }

  getIndexSet(): IndexSet {
    return this._indexSet;
  }

  getAreas(): AreaCollection {
    return this._areas;
  }
}
