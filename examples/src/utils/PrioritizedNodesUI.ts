/*!
 * Copyright 2026 Cognite AS
 */

import dat from 'dat.gui';
import {
  Cognite3DViewer,
  CogniteCadModel,
  DataSourceType,
  PrioritizedNodesJobClient,
  NodeIdNodeCollection,
  DefaultNodeAppearance
} from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';

/**
 * POC UI for triggering a PrioritizedNodes job on a loaded CAD model,
 * then loading the resulting high-detail output as an overlay.
 */
export class PrioritizedNodesUI {
  private readonly _client: CogniteClient;
  private readonly _viewer: Cognite3DViewer<DataSourceType>;
  private readonly _mainModel: CogniteCadModel;
  private readonly _jobClient: PrioritizedNodesJobClient;

  private _prioritizedModel: CogniteCadModel | undefined;

  constructor(
    uiFolder: dat.GUI,
    client: CogniteClient,
    viewer: Cognite3DViewer<DataSourceType>,
    mainModel: CogniteCadModel
  ) {
    this._client = client;
    this._viewer = viewer;
    this._mainModel = mainModel;
    this._jobClient = new PrioritizedNodesJobClient(client);

    this.createUI(uiFolder);
  }

  private createUI(folder: dat.GUI): void {
    const state = {
      nodeIds: '',
      jobStatus: 'idle',
      ghostMainModel: true,
      pollIntervalMs: 5000,
      timeoutMs: 600000
    };

    folder.add(state, 'nodeIds').name('Node IDs (comma-sep)');
    folder.add(state, 'pollIntervalMs', 1000, 30000, 1000).name('Poll interval (ms)');
    folder.add(state, 'timeoutMs', 60000, 1800000, 60000).name('Timeout (ms)');
    folder.add(state, 'ghostMainModel').name('Ghost main model');

    const statusController = folder.add(state, 'jobStatus').name('Job status');
    statusController.domElement.style.pointerEvents = 'none';

    const actions = {
      startJobAndLoad: async () => {
        const nodeIds = state.nodeIds
          .split(',')
          .map(s => parseInt(s.trim(), 10))
          .filter(n => !isNaN(n));

        if (nodeIds.length === 0) {
          state.jobStatus = 'Error: no valid node IDs';
          statusController.updateDisplay();
          return;
        }

        try {
          state.jobStatus = 'Starting job...';
          statusController.updateDisplay();

          const modelId = this._mainModel.modelId;
          const revisionId = this._mainModel.revisionId;

          const completedJob = await this._jobClient.startAndAwaitJob(
            { modelId, revisionId, nodeIds },
            state.pollIntervalMs,
            state.timeoutMs,
            status => {
              state.jobStatus = `${status.status} (job ${status.jobId})`;
              statusController.updateDisplay();
            }
          );

          state.jobStatus = `Completed (job ${completedJob.jobId}). Loading...`;
          statusController.updateDisplay();

          await this.loadPrioritizedOutput(modelId, revisionId, nodeIds, state.ghostMainModel);

          state.jobStatus = `Loaded (job ${completedJob.jobId})`;
          statusController.updateDisplay();
        } catch (e: any) {
          state.jobStatus = `Error: ${e.message}`;
          statusController.updateDisplay();
          console.error('PrioritizedNodes job failed:', e);
        }
      },

      loadExistingOutput: async () => {
        const nodeIds = state.nodeIds
          .split(',')
          .map(s => parseInt(s.trim(), 10))
          .filter(n => !isNaN(n));

        try {
          state.jobStatus = 'Loading existing output...';
          statusController.updateDisplay();

          const modelId = this._mainModel.modelId;
          const revisionId = this._mainModel.revisionId;

          await this.loadPrioritizedOutput(modelId, revisionId, nodeIds, state.ghostMainModel);

          state.jobStatus = 'Loaded';
          statusController.updateDisplay();
        } catch (e: any) {
          state.jobStatus = `Error: ${e.message}`;
          statusController.updateDisplay();
          console.error('Failed to load prioritized output:', e);
        }
      },

      removePrioritizedModel: () => {
        if (this._prioritizedModel) {
          this._viewer.removeModel(this._prioritizedModel);
          this._prioritizedModel = undefined;
          this._mainModel.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
          this._mainModel.removeAllStyledNodeCollections();
          state.jobStatus = 'idle';
          statusController.updateDisplay();
        }
      }
    };

    folder.add(actions, 'startJobAndLoad').name('Start job & load');
    folder.add(actions, 'loadExistingOutput').name('Load existing output');
    folder.add(actions, 'removePrioritizedModel').name('Remove overlay');
  }

  private async loadPrioritizedOutput(
    modelId: number,
    revisionId: number,
    nodeIds: number[],
    ghostMainModel: boolean
  ): Promise<void> {
    if (this._prioritizedModel) {
      this._viewer.removeModel(this._prioritizedModel);
      this._prioritizedModel = undefined;
    }

    const model = await this._viewer.addCadModel({
      modelId,
      revisionId,
      outputFormat: 'gltf-prioritized-nodes-directory'
    });
    this._prioritizedModel = model;

    if (ghostMainModel && nodeIds.length > 0) {
      this._mainModel.setDefaultNodeAppearance(DefaultNodeAppearance.Ghosted);
      const nodeSet = new NodeIdNodeCollection(this._client, this._mainModel);
      await nodeSet.executeFilter(nodeIds);
      this._mainModel.assignStyledNodeCollection(nodeSet, { renderGhosted: false });
    }
  }
}
