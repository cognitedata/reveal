/*!
 * Copyright 2026 Cognite AS
 */

import dat from 'dat.gui';
import {
  Cognite3DViewer,
  CogniteCadModel,
  DataSourceType,
  NodeIdNodeCollection,
  DefaultNodeAppearance
} from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';

const LOG_PREFIX = '[PrioritizedNodes]';

function logInfo(message: string, ...args: unknown[]): void {
  console.log(`%c${LOG_PREFIX} ${message}`, 'color: #2196F3; font-weight: bold', ...args);
}

function logAction(message: string, ...args: unknown[]): void {
  console.log(`%c${LOG_PREFIX} ${message}`, 'color: #4CAF50; font-weight: bold', ...args);
}

function logDetail(message: string, ...args: unknown[]): void {
  console.log(`  ${LOG_PREFIX} ${message}`, ...args);
}

function logWarn(message: string, ...args: unknown[]): void {
  console.warn(`${LOG_PREFIX} ${message}`, ...args);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Extracts model internals via the @internal cadNode property.
 * Returns undefined if the internal shape has changed.
 */
function getModelInternals(model: CogniteCadModel): {
  format: string;
  formatVersion: number;
  modelBaseUrl: string;
  unit: string;
  maxTreeIndex: number;
  sectorCount: number;
  sectors: Array<{
    id: number;
    depth: number;
    downloadSize: number;
    estimatedRenderCost: number;
    estimatedDrawCallCount: number;
    sectorFileName: string | null;
  }>;
} | undefined {
  try {
    const cadNode = (model as any).cadNode;
    if (!cadNode) return undefined;
    const metadata = cadNode.cadModelMetadata;
    if (!metadata) return undefined;
    const scene = metadata.scene;
    if (!scene) return undefined;
    const allSectors = scene.getAllSectors?.() ?? [];
    return {
      format: metadata.format ?? 'unknown',
      formatVersion: metadata.formatVersion ?? 0,
      modelBaseUrl: metadata.modelBaseUrl ?? 'unknown',
      unit: scene.unit ?? 'unknown',
      maxTreeIndex: scene.maxTreeIndex ?? 0,
      sectorCount: scene.sectorCount ?? 0,
      sectors: allSectors.map((s: any) => ({
        id: s.id,
        depth: s.depth,
        downloadSize: s.downloadSize ?? 0,
        estimatedRenderCost: s.estimatedRenderCost ?? 0,
        estimatedDrawCallCount: s.estimatedDrawCallCount ?? 0,
        sectorFileName: s.sectorFileName ?? null
      }))
    };
  } catch {
    return undefined;
  }
}

function logModelDetails(model: CogniteCadModel, label: string): void {
  const internals = getModelInternals(model);
  if (!internals) {
    logDetail('%s — Could not read internal model details', label);
    logDetail('  Model ID: %d, Revision ID: %d, Node count: %d', model.modelId, model.revisionId, model.nodeCount);
    return;
  }

  const { sectors } = internals;
  const totalDownloadSize = sectors.reduce((sum, s) => sum + s.downloadSize, 0);
  const totalRenderCost = sectors.reduce((sum, s) => sum + s.estimatedRenderCost, 0);
  const totalDrawCalls = sectors.reduce((sum, s) => sum + s.estimatedDrawCallCount, 0);
  const maxDepth = sectors.reduce((max, s) => Math.max(max, s.depth), 0);
  const sectorsWithGeometry = sectors.filter(s => s.sectorFileName !== null).length;

  const depthBuckets = new Map<number, number>();
  for (const s of sectors) {
    depthBuckets.set(s.depth, (depthBuckets.get(s.depth) ?? 0) + 1);
  }
  const depthSummary = [...depthBuckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([depth, count]) => `depth ${depth}: ${count}`)
    .join(', ');

  console.groupCollapsed(`  ${LOG_PREFIX} ${label}`);
  console.table({
    'Output format': internals.format,
    'Format version': internals.formatVersion,
    'Base URL': internals.modelBaseUrl,
    'Unit': internals.unit,
    'Node count': `${internals.maxTreeIndex + 1} (maxTreeIndex: ${internals.maxTreeIndex})`,
    'Total sectors': internals.sectorCount,
    'Sectors with .glb': sectorsWithGeometry,
    'Max sector depth': maxDepth,
    'Total download size': formatBytes(totalDownloadSize),
    'Est. render cost': totalRenderCost.toLocaleString(),
    'Est. draw calls': totalDrawCalls.toLocaleString(),
    'Sector depth distribution': depthSummary
  });
  console.groupEnd();
}

/**
 * POC UI for loading prioritized nodes output in two modes:
 *
 * 1. **Replace mode**: Swaps the entire model to the prioritized output.
 *    Shows the same model but with higher-detail geometry for prioritized nodes.
 *
 * 2. **Overlay mode**: Loads the prioritized output as a second model on top.
 *    Original model is ghosted with prioritized nodes hidden; overlay shows
 *    only the prioritized nodes at full detail. Requires node IDs input.
 */
export class PrioritizedNodesUI {
  private readonly _client: CogniteClient;
  private readonly _viewer: Cognite3DViewer<DataSourceType>;

  private readonly _modelId: number;
  private readonly _revisionId: number;

  private _mainModel: CogniteCadModel;
  private _overlayModel: CogniteCadModel | undefined;
  private _isReplaced: boolean = false;

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

    logInfo('Initialized for model %d, revision %d', this._modelId, this._revisionId);
    logModelDetails(mainModel, 'Initial model');

    this.createReplaceUI(uiFolder.addFolder('Replace model'));
    this.createOverlayUI(uiFolder.addFolder('Overlay with node IDs'));
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
          logAction('=== REPLACE MODE: Loading prioritized output ===');
          updateStatus('Replacing model...');

          logInfo('REMOVING standard model:');
          logModelDetails(this._mainModel, 'Model being removed (gltf-directory)');

          const startTime = performance.now();
          this._viewer.removeModel(this._mainModel);
          logDetail('Standard model removed from viewer');

          logInfo('LOADING prioritized model...');
          this._mainModel = await this._viewer.addCadModel({
            modelId: this._modelId,
            revisionId: this._revisionId,
            outputFormat: 'gltf-prioritized-nodes-directory'
          });
          this._viewer.loadCameraFromModel(this._mainModel);
          this._isReplaced = true;

          const elapsed = (performance.now() - startTime).toFixed(0);
          logInfo('LOADED prioritized model:');
          logModelDetails(this._mainModel, 'Model now active (gltf-prioritized-nodes-directory)');
          logDetail('Sectors from this model are LOCKED — they will not be evicted when budget is reduced');
          logAction('Replace complete in %s ms', elapsed);
          updateStatus('Prioritized output loaded');
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          updateStatus(`Error: ${msg}`);
          logWarn('Failed to load prioritized output: %s', msg);
        }
      },

      revert: async () => {
        if (!this._isReplaced) {
          updateStatus('Already using standard output');
          return;
        }
        try {
          logAction('=== REPLACE MODE: Reverting to standard output ===');
          updateStatus('Reverting...');

          logInfo('REMOVING prioritized model:');
          logModelDetails(this._mainModel, 'Model being removed (gltf-prioritized-nodes-directory)');

          const startTime = performance.now();
          this._viewer.removeModel(this._mainModel);
          logDetail('Prioritized model removed from viewer');

          logInfo('LOADING standard model...');
          this._mainModel = await this._viewer.addCadModel({
            modelId: this._modelId,
            revisionId: this._revisionId
          });
          this._viewer.loadCameraFromModel(this._mainModel);
          this._isReplaced = false;

          const elapsed = (performance.now() - startTime).toFixed(0);
          logInfo('LOADED standard model:');
          logModelDetails(this._mainModel, 'Model now active (gltf-directory)');
          logAction('Revert complete in %s ms', elapsed);
          updateStatus('Standard output');
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          updateStatus(`Error: ${msg}`);
          logWarn('Failed to revert: %s', msg);
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
          updateStatus('Loading overlay...');
          await this.loadOverlayView(nodeIds);
          updateStatus(`Overlay active (${nodeIds.length} nodes)`);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          updateStatus(`Error: ${msg}`);
          logWarn('Failed to load overlay: %s', msg);
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

  private async loadOverlayView(nodeIds: number[]): Promise<void> {
    this.removeOverlay();

    logAction('=== OVERLAY MODE: Loading prioritized nodes overlay ===');
    logDetail('Prioritized node IDs: [%s]', nodeIds.join(', '));
    logDetail('Total prioritized nodes: %d', nodeIds.length);

    logInfo('ORIGINAL model (stays loaded, will be re-styled):');
    logModelDetails(this._mainModel, 'Original model (gltf-directory)');

    const startTime = performance.now();

    logInfo('LOADING overlay model...');
    const overlayModel = await this._viewer.addCadModel({
      modelId: this._modelId,
      revisionId: this._revisionId,
      outputFormat: 'gltf-prioritized-nodes-directory'
    });
    this._overlayModel = overlayModel;
    const loadTime = (performance.now() - startTime).toFixed(0);
    logInfo('LOADED overlay model in %s ms:', loadTime);
    logModelDetails(overlayModel, 'Overlay model (gltf-prioritized-nodes-directory)');
    logDetail('Overlay model sectors are LOCKED — they will not be evicted when budget is reduced');

    logInfo('Applying styling to combine both models...');

    logDetail('Step 1: Ghost all %d nodes in original model (standard-detail) → semi-transparent context', this._mainModel.nodeCount);
    this._mainModel.setDefaultNodeAppearance(DefaultNodeAppearance.Ghosted);

    logDetail('Step 2: Hide %d prioritized nodes in original model (standard-detail) → removes their low-detail geometry from view', nodeIds.length);
    const mainNodeSet = new NodeIdNodeCollection(this._client, this._mainModel);
    await mainNodeSet.executeFilter(nodeIds);
    this._mainModel.assignStyledNodeCollection(mainNodeSet, { visible: false });
    const mainTreeIndices = mainNodeSet.getIndexSet();
    logDetail('         %d node IDs → %d tree indices resolved on original model', nodeIds.length, mainTreeIndices.count);

    logDetail('Step 3: Hide all nodes in overlay model (high-detail) by default');
    overlayModel.setDefaultNodeAppearance({ visible: false });

    logDetail('Step 4: Show %d prioritized nodes in overlay model (high-detail) → replaces hidden standard-detail with high-detail geometry', nodeIds.length);
    const overlayNodeSet = new NodeIdNodeCollection(this._client, overlayModel);
    await overlayNodeSet.executeFilter(nodeIds);
    overlayModel.assignStyledNodeCollection(overlayNodeSet, DefaultNodeAppearance.Default);
    const overlayTreeIndices = overlayNodeSet.getIndexSet();
    logDetail('         %d node IDs → %d tree indices resolved on overlay model', nodeIds.length, overlayTreeIndices.count);

    const totalTime = (performance.now() - startTime).toFixed(0);
    logAction('Overlay setup complete in %s ms', totalTime);
    logInfo('Result:');
    logDetail('  Original model (gltf-directory, standard-detail):');
    logDetail('    %d nodes → ghosted (semi-transparent context)', this._mainModel.nodeCount - mainTreeIndices.count);
    logDetail('    %d nodes → hidden (replaced by high-detail from overlay)', mainTreeIndices.count);
    logDetail('  Overlay model (gltf-prioritized-nodes-directory, high-detail):');
    logDetail('    %d nodes → visible at HIGH DETAIL (prioritized geometry)', overlayTreeIndices.count);
    logDetail('    %d nodes → hidden (not prioritized)', overlayModel.nodeCount - overlayTreeIndices.count);
  }

  private removeOverlay(): void {
    if (this._overlayModel) {
      logAction('=== OVERLAY MODE: Removing overlay ===');
      logInfo('REMOVING overlay model:');
      logModelDetails(this._overlayModel, 'Overlay model being removed');
      this._viewer.removeModel(this._overlayModel);
      this._overlayModel = undefined;
      logDetail('Restoring original model styling to default');
    }
    this._mainModel.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
    this._mainModel.removeAllStyledNodeCollections();
    logDetail('Original model restored to standard appearance');
  }
}
