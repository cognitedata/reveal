import { THREE } from '@cognite/reveal';
import { Cognite3DModel, Cognite3DViewer, DefaultNodeAppearance, IndexSet, NodeAppearance, NumericRange, TreeIndexNodeCollection } from '@cognite/reveal';
import { HtmlOverlayTool } from '@cognite/reveal/tools';
import { CogniteClient } from '@cognite/sdk/dist/src';
import * as dat from 'dat.gui';

type OverlayUserdata = {
  treeIndex: number;
  subtreeSize: number;
  bounds: THREE.Box3;
}

export class BulkHtmlOverlayUI {
  private readonly _activeElementsNodeAppearance: NodeAppearance = DefaultNodeAppearance.Highlighted;

  private readonly _viewer: Cognite3DViewer;
  private readonly _model: Cognite3DModel;
  private readonly _sdk: CogniteClient;
  private readonly _overlays: HtmlOverlayTool;
  private readonly _activeElements: TreeIndexNodeCollection;
  private readonly _uiState = {
    filterCategory: 'PDMS',
    filterKey: 'Description',
    filterValue: 'Tagged equipment'
  };

  constructor(uiFolder: dat.GUI, viewer: Cognite3DViewer, model: Cognite3DModel, sdk: CogniteClient) {
    this._viewer = viewer;
    this._model = model;
    this._sdk = sdk;
    this._overlays = new HtmlOverlayTool(this._viewer,
      {
        clusteringOptions: {
          mode: 'overlapInScreenSpace',
          createClusterElementCallback: (elements) => {
            const userData = elements.map(x => x.userData as OverlayUserdata);
            return this.createCompositeOverlay(`${elements.length} tags`, userData);
          }
        }
      });
    this._activeElements = new TreeIndexNodeCollection();

    const actions = {
      createTagOverlays: () => this.createTagOverlays(),
      clearOverlays: () => {
        this._overlays.clear();
        this._activeElements.clear();
      }
    };
    uiFolder.add(this._uiState, 'filterCategory').name('Filter category');
    uiFolder.add(this._uiState, 'filterKey').name('Filter key');
    uiFolder.add(this._uiState, 'filterValue').name('Filter property value');
    uiFolder.add(actions, 'createTagOverlays').name('Create overlays');
    uiFolder.add(actions, 'clearOverlays').name('Clear');

    this._model.assignStyledNodeCollection(this._activeElements, this._activeElementsNodeAppearance);
  }

  private async createTagOverlays() {
    const { modelId, revisionId } = this._model;
    const { filterCategory, filterKey, filterValue } = this._uiState;

    const matchedNodes = await this._sdk.revisions3D.list3DNodes(modelId, revisionId, { limit: 1000, properties: { [filterCategory]: { [filterKey]: filterValue } } }).autoPagingToArray();


    for (let i = 0; i < matchedNodes.length; ++i) {
      const { id } = matchedNodes[i];
      const nodesToTag = await this._sdk.revisions3D.list3DNodes(modelId, revisionId, { depth: 1, nodeId: id, limit: 1000 }).autoPagingToArray();
      for (const nodeToTag of nodesToTag) {
        if (nodeToTag.boundingBox === undefined) {
          continue;
        }
        const { boundingBox,name, treeIndex, subtreeSize } = nodeToTag;

        const bounds = new THREE.Box3();
        bounds.min.set(boundingBox.min[0], boundingBox.min[1], boundingBox.min[2]);
        bounds.max.set(boundingBox.max[0], boundingBox.max[1], boundingBox.max[2]);
        this._model.mapBoxFromCdfToModelCoordinates(bounds, bounds);
        const center = bounds.getCenter(new THREE.Vector3());

        const htmlElement = this.createTagOverlay(name, bounds, treeIndex, subtreeSize);
        const userData: OverlayUserdata = { bounds, treeIndex, subtreeSize };
        this._overlays.add(htmlElement, center, { userData });
      }
    }
  }

  private createTagOverlay(text: string, bounds: THREE.Box3, treeIndex: number, subtreeSize: number): HTMLElement {
    const htmlElement = createOverlay(text);
    htmlElement.onclick = () => {
      this._viewer.fitCameraToBoundingBox(bounds);
      this._activeElements.updateSet(new IndexSet(new NumericRange(treeIndex, subtreeSize)));
      // Might be added already but add again to make sure it's not been removed
      this._model.assignStyledNodeCollection(this._activeElements, this._activeElementsNodeAppearance);
    };
    return htmlElement;
  }
  
  private createCompositeOverlay(text: string, elementData: OverlayUserdata[]): HTMLElement {
    const htmlElement = createOverlay(text);
    htmlElement.onclick = () => {
      const indexSet = new IndexSet();
      const combinedBounds = new THREE.Box3();
      elementData.forEach(element => {
        combinedBounds.union(element.bounds);
        indexSet.addRange(new NumericRange(element.treeIndex, element.subtreeSize));
      });
      console.log(indexSet);
      this._activeElements.updateSet(indexSet);
      this._viewer.fitCameraToBoundingBox(combinedBounds);
      // Might be added already but add again to make sure it's not been removed
      this._model.assignStyledNodeCollection(this._activeElements, DefaultNodeAppearance.Highlighted);
    };
    return htmlElement;
  }
}


function createOverlay(text: string): HTMLElement {
  const element = document.createElement('div');
  element.innerText = text;
  element.style.cssText = `
    position: absolute;

    /* Anchor to the center of the element and ignore events */
    transform: translate(-50%, -50%);
    // pointer-events: none;
    touch-action: none;
    user-select: none;

    /* Make it look nice */
    padding: 10px;
    minHeight: 50px;
    color: #fff;
    background: #232323da;
    borderRadius: 0.25em;
    border: '#ffffff22 solid 2px;
    font-family: Roberto;
    font-size: 8pt;
  `;
  return element;
}
