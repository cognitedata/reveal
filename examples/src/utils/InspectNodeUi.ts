import * as dat from 'dat.gui';
import * as THREE from 'three';
import { Cognite3DModel, Cognite3DViewer, DefaultCameraManager } from "@cognite/reveal";
import { CogniteClient, Node3D } from "@cognite/sdk";
import { TreeIndexNodeCollection } from '@cognite/reveal';
import { NumericRange } from '@cognite/reveal';
import { DefaultNodeAppearance } from '@cognite/reveal';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

export class InspectNodeUI {
  private readonly _uiFolder: dat.GUI;
  private readonly _uiSubFolders: dat.GUI[] = [];
  private readonly _sdk: CogniteClient;
  private readonly _viewer: Cognite3DViewer;

  constructor(uiFolder: dat.GUI, sdk: CogniteClient, viewer: Cognite3DViewer) {
    this._uiFolder = uiFolder;
    this._sdk = sdk;
    this._viewer = viewer;
  }

  async inspectNode(model: Cognite3DModel, treeIndex: number): Promise<void> {
    this.clearUi();
    this.createLoadingIndicator();

    const nodeId = await model.mapTreeIndexToNodeId(treeIndex);
    const nodes = await this._sdk.revisions3D.list3DNodeAncestors(model.modelId, model.revisionId, nodeId).autoPagingToArray();

    this.clearUi();
    
    if (nodes.length === 0) {
      this.createNoNodes();
    }

    for (const node of nodes) {
      const nodeUi = this._uiFolder.addFolder(`${node.name} [depth=${node.depth}]`);
      this.registerUiFolder(nodeUi);
      this.createNodePropertiesFolder(model, node, nodeUi);
    }
  }

  private createLoadingIndicator() {
    const loadingUi = this._uiFolder.addFolder('Loading...');
    this.registerUiFolder(loadingUi);
  }
  
  private createNodePropertiesFolder(model: Cognite3DModel, node: Node3D, nodeUi: dat.GUI) {
    nodeUi.add(node, 'treeIndex').name('Tree index');
    nodeUi.add(node, 'subtreeSize').name('Node count');
    const actions = {
      highlight: () => {
        const nodeCollection = new TreeIndexNodeCollection(new NumericRange(node.treeIndex, node.subtreeSize));
        model.assignStyledNodeCollection(nodeCollection, DefaultNodeAppearance.Highlighted);
      },
      resetAndHighlight: () => {
        model.removeAllStyledNodeCollections();
        actions.highlight();
      },
      hide: () => {
        const nodeCollection = new TreeIndexNodeCollection(new NumericRange(node.treeIndex, node.subtreeSize));
        model.assignStyledNodeCollection(nodeCollection, DefaultNodeAppearance.Hidden);
      },
      addTranslationGizmo: async () => {
        // Create dummy object that can be dragged around
        const bbox = await model.getBoundingBoxByTreeIndex(node.treeIndex);
        const startPosition = bbox.getCenter(new THREE.Vector3());
        const draggable = new THREE.Object3D();
        draggable.position.copy(startPosition);
        
        const gizmo = new TransformControls(this._viewer.getCamera(), this._viewer.renderer.domElement);
        const offset = new THREE.Vector3();
        const transform = new THREE.Matrix4();
        gizmo.addEventListener('change', () => {
          offset.copy(draggable.position);
          offset.addScaledVector(startPosition, -1.0);
          transform.makeTranslation(offset.x, offset.y, offset.z);
          model.setNodeTransformByTreeIndex(node.treeIndex, transform);
          this._viewer.requestRedraw();
        });
				gizmo.addEventListener( 'dragging-changed', (event: any) =>  {
          const dragging: boolean = event.value;
					const cameraManager: DefaultCameraManager = this._viewer.cameraManager as DefaultCameraManager;
          cameraManager.cameraControlsEnabled = !dragging;
				} );

        this._viewer.addObject3D(gizmo);
        this._viewer.addObject3D(draggable);

        gizmo.attach(draggable);
      }
    };
    nodeUi.add(actions, 'hide').name('Hide');
    nodeUi.add(actions, 'highlight').name('Highlight');
    nodeUi.add(actions, 'resetAndHighlight').name('Reset+highlight');
    nodeUi.add(actions, 'addTranslationGizmo').name('Drag');

    if (node.properties === undefined) {
      return;
    }
    for (const [category, entries] of Object.entries(node.properties)) {
      const categoryFolder = nodeUi.addFolder(category);

      for (const key of Object.keys(entries)) {
        categoryFolder.add(entries, key).name(key);
      }
    }
  }

  private createNoNodes() {
    this.registerUiFolder(this._uiFolder.addFolder('Could not find node'));
  }

  private registerUiFolder(folder: dat.GUI) {
    this._uiSubFolders.push(folder);
  }

  private clearUi() {
    this._uiSubFolders.forEach(folder => this._uiFolder.removeFolder(folder));
    this._uiSubFolders.splice(0);
  }
}