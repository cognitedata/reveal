/*!
 * Copyright 2026 Cognite AS
 */

import dat from 'dat.gui';
import {
  Cognite3DViewer,
  CogniteCadModel,
  DataSourceType,
  NodeIdNodeCollection,
  DefaultNodeAppearance,
  File3dFormat
} from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';

/**
 * Example UI for loading high-priority nodes in two modes:
 *
 * 1. **Replace mode**: Swaps the entire model to the prioritized output.
 * 2. **Overlay mode**: Loads the prioritized output as a second model on top,
 *    ghosting the original and showing only the prioritized nodes at full detail.
 * 3. **Lock mode**: Locks specific nodes on the original model so their sectors
 *    are never evicted when the CAD budget is reduced.
 */
export class PrioritizedNodesUI {
  private readonly _client: CogniteClient;
  private readonly _viewer: Cognite3DViewer<DataSourceType>;

  private readonly _modelId: number;
  private readonly _revisionId: number;

  private _mainModel: CogniteCadModel;
  private _overlayModel: CogniteCadModel | undefined;
  private _isReplaced: boolean = false;
  private _overlayLoadGeneration: number = 0;

  constructor(
    uiFolder: dat.GUI,
    client: CogniteClient,
    viewer: Cognite3DViewer<DataSourceType>,
    mainModel: CogniteCadModel
  ) {
    this._client = client;
    this._viewer = viewer;
    this._mainModel = mainModel;
    this._modelId = mainModel.modelId;
    this._revisionId = mainModel.revisionId;

    this.createReplaceUI(uiFolder.addFolder('Replace model'));
    this.createOverlayUI(uiFolder.addFolder('Overlay with node IDs'));
    this.createLockTreeIndicesUI(uiFolder.addFolder('Lock tree indices'));
  }

  private createReplaceUI(folder: dat.GUI): void {
    const state = { status: 'Standard output' };
    const statusCtrl = folder.add(state, 'status').name('Status');
    statusCtrl.domElement.style.pointerEvents = 'none';

    const updateStatus = (msg: string): void => {
      state.status = msg;
      statusCtrl.updateDisplay();
    };

    const actions = {
      loadPrioritized: async () => {
        if (this._isReplaced) {
          updateStatus('Already using prioritized output');
          return;
        }
        if (this._overlayModel) {
          updateStatus('Revert overlay first');
          return;
        }
        try {
          this._viewer.removeModel(this._mainModel);
          this._mainModel = await this._viewer.addCadModel({
            modelId: this._modelId,
            revisionId: this._revisionId,
            outputFormat: File3dFormat.GltfPrioritizedNodes
          });
          this._viewer.loadCameraFromModel(this._mainModel);
          this._isReplaced = true;
          updateStatus('Prioritized output loaded');
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          updateStatus(`Error: ${msg}`);
        }
      },

      revert: async () => {
        if (!this._isReplaced) {
          updateStatus('Already using standard output');
          return;
        }
        try {
          this._viewer.removeModel(this._mainModel);
          this._mainModel = await this._viewer.addCadModel({
            modelId: this._modelId,
            revisionId: this._revisionId
          });
          this._viewer.loadCameraFromModel(this._mainModel);
          this._isReplaced = false;
          updateStatus('Standard output');
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          updateStatus(`Error: ${msg}`);
        }
      }
    };

    folder.add(actions, 'loadPrioritized').name('Load prioritized');
    folder.add(actions, 'revert').name('Revert to standard');
  }

  private createOverlayUI(folder: dat.GUI): void {
    const state = { nodeIds: '', status: 'Ready' };

    folder.add(state, 'nodeIds').name('Node IDs (comma-sep)');
    const statusCtrl = folder.add(state, 'status').name('Status');
    statusCtrl.domElement.style.pointerEvents = 'none';

    const updateStatus = (msg: string): void => {
      state.status = msg;
      statusCtrl.updateDisplay();
    };

    const parseNodeIds = (): number[] =>
      state.nodeIds
        .split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n));

    const actions = {
      loadOverlay: async () => {
        const nodeIds = parseNodeIds();
        if (nodeIds.length === 0) {
          updateStatus('Error: enter node IDs first');
          return;
        }
        if (this._isReplaced) {
          updateStatus('Revert replace first');
          return;
        }
        try {
          await this.loadOverlayView(nodeIds);
          updateStatus(`Overlay active (${nodeIds.length} nodes)`);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          updateStatus(`Error: ${msg}`);
          this.removeOverlay();
        }
      },

      revert: () => {
        this.removeOverlay();
        updateStatus('Ready');
      }
    };

    folder.add(actions, 'loadOverlay').name('Load overlay');
    folder.add(actions, 'revert').name('Remove overlay');
  }

  private createLockTreeIndicesUI(folder: dat.GUI): void {
    const state = { nodeIds: '', status: 'No locks' };

    folder.add(state, 'nodeIds').name('Node IDs (comma-sep)');
    const statusCtrl = folder.add(state, 'status').name('Status');
    statusCtrl.domElement.style.pointerEvents = 'none';

    const updateStatus = (msg: string): void => {
      state.status = msg;
      statusCtrl.updateDisplay();
    };

    const parseNodeIds = (): number[] =>
      state.nodeIds
        .split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n));

    const actions = {
      lock: async () => {
        const nodeIds = parseNodeIds();
        if (nodeIds.length === 0) {
          updateStatus('Error: enter node IDs first');
          return;
        }
        try {
          const nodeCollection = new NodeIdNodeCollection(this._client, this._mainModel);
          await nodeCollection.executeFilter(nodeIds);
          const treeIndices = nodeCollection.getIndexSet().toIndexArray();

          if (treeIndices.length === 0) {
            updateStatus(`Error: no tree indices found for node IDs [${nodeIds.join(', ')}]`);
            return;
          }

          this._mainModel.assignStyledNodeCollection(nodeCollection, DefaultNodeAppearance.Default);
          this._mainModel.lockTreeIndices(treeIndices);
          updateStatus(`Locked ${treeIndices.length} tree indices`);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          updateStatus(`Error: ${msg}`);
        }
      },

      unlock: () => {
        this._mainModel.unlockAllTreeIndices();
        this._mainModel.removeAllStyledNodeCollections();
        updateStatus('No locks');
      }
    };

    folder.add(actions, 'lock').name('Lock nodes');
    folder.add(actions, 'unlock').name('Unlock all');
  }

  private async loadOverlayView(nodeIds: number[]): Promise<void> {
    this.removeOverlay();

    const generation = ++this._overlayLoadGeneration;

    const overlayModel = await this._viewer.addCadModel({
      modelId: this._modelId,
      revisionId: this._revisionId,
      outputFormat: File3dFormat.GltfPrioritizedNodes
    });

    if (generation !== this._overlayLoadGeneration) {
      // A newer loadOverlayView call started while we were awaiting — discard this model.
      this._viewer.removeModel(overlayModel);
      return;
    }

    this._overlayModel = overlayModel;

    this._mainModel.setDefaultNodeAppearance(DefaultNodeAppearance.Ghosted);

    const mainNodeSet = new NodeIdNodeCollection(this._client, this._mainModel);
    await mainNodeSet.executeFilter(nodeIds);

    if (mainNodeSet.getIndexSet().count === 0) {
      throw new Error(`None of the node IDs [${nodeIds.join(', ')}] exist in this model/revision.`);
    }

    this._mainModel.assignStyledNodeCollection(mainNodeSet, { visible: false });

    overlayModel.setDefaultNodeAppearance({ visible: false });
    const overlayNodeSet = new NodeIdNodeCollection(this._client, overlayModel);
    await overlayNodeSet.executeFilter(nodeIds);
    overlayModel.assignStyledNodeCollection(overlayNodeSet, DefaultNodeAppearance.Default);

    this._viewer.requestRedraw();
  }

  private removeOverlay(): void {
    if (this._overlayModel) {
      this._viewer.removeModel(this._overlayModel);
      this._overlayModel = undefined;
    }
    this._mainModel.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
    this._mainModel.removeAllStyledNodeCollections();
    this._viewer.requestRedraw();
  }
}
