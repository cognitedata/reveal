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
 * Tracks "generations" of an asynchronous operation so that only the most recently
 * *started* call is allowed to apply its result, regardless of resolution order.
 *
 * Without this, two overlapping async calls (e.g. triggered by rapid clicks or selection
 * changes) can race: since network requests don't necessarily resolve in the order they were
 * started, an older/stale call can resolve after a newer one and incorrectly overwrite its
 * result, error message, or UI status.
 *
 * Usage: call `start()` at the beginning of the operation, then check the returned
 * `isCurrent()` after every `await` (and in `catch` blocks) before applying any result, error,
 * or status update. Call `invalidate()` from anywhere else that clears/replaces the same state
 * (e.g. an explicit "remove"/"unlock" action) so an in-flight call can't resurrect it.
 */
class LatestCallGuard {
  private _generation = 0;

  start(): () => boolean {
    const generation = ++this._generation;
    return () => generation === this._generation;
  }

  invalidate(): void {
    this._generation++;
  }
}

/**
 * Example UI for loading high-priority nodes in two modes:
 *
 * 1. **Replace mode**: Swaps the entire model to the prioritized output.
 * 2. **Overlay mode**: Loads the prioritized output as a second model on top,
 *    ghosting the original and showing only the prioritized nodes at full detail.
 * 3. **Lock mode**: Locks specific nodes on the original model so their sectors
 *    are never evicted when the CAD budget is reduced.
 *
 * All three modes guard against overlapping calls (e.g. rapid clicks) using
 * {@link LatestCallGuard}, so a stale, superseded call can never accumulate state, overwrite a
 * newer call's result, or surface a stale error message.
 */
export class PrioritizedNodesUI {
  private readonly _client: CogniteClient;
  private readonly _viewer: Cognite3DViewer<DataSourceType>;

  private readonly _modelId: number;
  private readonly _revisionId: number;

  private _mainModel: CogniteCadModel;
  private _overlayModel: CogniteCadModel | undefined;
  private _isReplaced: boolean = false;
  private readonly _replaceGuard = new LatestCallGuard();
  private readonly _overlayGuard = new LatestCallGuard();
  private readonly _lockGuard = new LatestCallGuard();

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

    const swapModel = async (outputFormat: File3dFormat | undefined, replaced: boolean): Promise<void> => {
      if (this._overlayModel) {
        updateStatus('Revert overlay first');
        return;
      }

      const isCurrent = this._replaceGuard.start();
      const modelToRemove = this._mainModel;
      let newModel: CogniteCadModel;
      try {
        newModel = await this._viewer.addCadModel({
          modelId: this._modelId,
          revisionId: this._revisionId,
          ...(outputFormat !== undefined ? { outputFormat } : {})
        });
      } catch (e: unknown) {
        if (!isCurrent()) {
          // Superseded by a newer call — discard this stale error, the newer call owns status now.
          return;
        }
        const msg = e instanceof Error ? e.message : String(e);
        updateStatus(`Error: ${msg}`);
        return;
      }

      if (!isCurrent()) {
        // A newer call started while we were awaiting — discard this result, keeping
        // `modelToRemove` (the newer call's starting point) intact.
        this._viewer.removeModel(newModel);
        return;
      }

      this._viewer.removeModel(modelToRemove);
      this._mainModel = newModel;
      this._viewer.loadCameraFromModel(this._mainModel);
      this._isReplaced = replaced;
      updateStatus(replaced ? 'Prioritized output loaded' : 'Standard output');
    };

    const actions = {
      loadPrioritized: async () => {
        if (this._isReplaced) {
          updateStatus('Already using prioritized output');
          return;
        }
        await swapModel(File3dFormat.GltfPrioritizedNodes, true);
      },

      revert: async () => {
        if (!this._isReplaced) {
          updateStatus('Already using standard output');
          return;
        }
        await swapModel(undefined, false);
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

        const applied = await this.loadOverlayView(nodeIds);
        if (applied === 'ok') {
          updateStatus(`Overlay active (${nodeIds.length} nodes)`);
        } else if (applied !== 'superseded') {
          updateStatus(`Error: ${applied.message}`);
          this.removeOverlay();
        }
        // 'superseded' means a newer call (or an explicit "Remove overlay") already owns the
        // current state, so this stale call must not touch status or trigger cleanup.
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

        const isCurrent = this._lockGuard.start();
        const nodeCollection = new NodeIdNodeCollection(this._client, this._mainModel);
        try {
          await nodeCollection.executeFilter(nodeIds);
        } catch (e: unknown) {
          if (!isCurrent()) {
            // Superseded by a newer `lock` call (or `unlock`) — discard this stale error so
            // it can't overwrite the status of whatever call is now current.
            return;
          }
          const msg = e instanceof Error ? e.message : String(e);
          updateStatus(`Error: ${msg}`);
          return;
        }

        if (!isCurrent()) {
          // A newer `lock` call (or `unlock`) started while we were awaiting — discard this
          // result so an older, slower-resolving request can't overwrite a newer one's state.
          return;
        }

        const treeIndices = nodeCollection.getIndexSet().toIndexArray();

        if (treeIndices.length === 0) {
          updateStatus(`Error: no tree indices found for node IDs [${nodeIds.join(', ')}]`);
          return;
        }

        // Release any previously locked set right before applying the new one. Since this
        // point is only reached by the current (non-superseded) call, this can never accumulate.
        this._mainModel.unlockAllTreeIndices();
        this._mainModel.removeAllStyledNodeCollections();

        this._mainModel.assignStyledNodeCollection(nodeCollection, DefaultNodeAppearance.Default);
        this._mainModel.lockTreeIndices(treeIndices);
        updateStatus(`Locked ${treeIndices.length} tree indices`);
      },

      unlock: () => {
        // Invalidate any in-flight `lock` call so it can't re-apply after this clears state.
        this._lockGuard.invalidate();
        this._mainModel.unlockAllTreeIndices();
        this._mainModel.removeAllStyledNodeCollections();
        updateStatus('No locks');
      }
    };

    folder.add(actions, 'lock').name('Lock nodes');
    folder.add(actions, 'unlock').name('Unlock all');
  }

  /**
   * Loads the prioritized-output overlay for `nodeIds`.
   * @returns 'ok' if this call's result was applied, 'superseded' if a newer call (or an
   * explicit `removeOverlay()`) invalidated this call before it finished — in which case the
   * caller must not touch status or perform error cleanup — or the `Error` that occurred, if
   * this call was still current when it failed.
   */
  private async loadOverlayView(nodeIds: number[]): Promise<'ok' | 'superseded' | Error> {
    this.removeOverlay();
    const isCurrent = this._overlayGuard.start();

    let overlayModel: CogniteCadModel;
    try {
      overlayModel = await this._viewer.addCadModel({
        modelId: this._modelId,
        revisionId: this._revisionId,
        outputFormat: File3dFormat.GltfPrioritizedNodes
      });
    } catch (e: unknown) {
      if (!isCurrent()) {
        return 'superseded';
      }
      return e instanceof Error ? e : new Error(String(e));
    }

    if (!isCurrent()) {
      // A newer loadOverlayView call (or an explicit removeOverlay) started while we were
      // awaiting — discard this model, it was never assigned to `this._overlayModel`.
      this._viewer.removeModel(overlayModel);
      return 'superseded';
    }

    this._overlayModel = overlayModel;

    try {
      this._mainModel.setDefaultNodeAppearance(DefaultNodeAppearance.Ghosted);

      const mainNodeSet = new NodeIdNodeCollection(this._client, this._mainModel);
      await mainNodeSet.executeFilter(nodeIds);
      if (!isCurrent()) {
        return 'superseded';
      }

      if (mainNodeSet.getIndexSet().count === 0) {
        throw new Error(`None of the node IDs [${nodeIds.join(', ')}] exist in this model/revision.`);
      }
      this._mainModel.assignStyledNodeCollection(mainNodeSet, { visible: false });

      overlayModel.setDefaultNodeAppearance({ visible: false });
      const overlayNodeSet = new NodeIdNodeCollection(this._client, overlayModel);
      await overlayNodeSet.executeFilter(nodeIds);
      if (!isCurrent()) {
        return 'superseded';
      }

      overlayModel.assignStyledNodeCollection(overlayNodeSet, DefaultNodeAppearance.Default);
      this._viewer.requestRedraw();
      return 'ok';
    } catch (e: unknown) {
      if (!isCurrent()) {
        return 'superseded';
      }
      return e instanceof Error ? e : new Error(String(e));
    }
  }

  private removeOverlay(): void {
    // Invalidate any in-flight loadOverlayView call so it can't re-apply after this clears state.
    this._overlayGuard.invalidate();
    if (this._overlayModel) {
      this._viewer.removeModel(this._overlayModel);
      this._overlayModel = undefined;
    }
    this._mainModel.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
    this._mainModel.removeAllStyledNodeCollections();
    this._viewer.requestRedraw();
  }
}
