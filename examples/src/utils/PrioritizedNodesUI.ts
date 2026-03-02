/*!
 * Copyright 2026 Cognite AS
 */

import dat from 'dat.gui';
import {
  Cognite3DViewer,
  CogniteCadModel,
  DataSourceType
} from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';

/**
 * POC UI for loading a CAD model with the prioritized nodes output.
 *
 * The 'gltf-prioritized-nodes-directory' output has the same sector structure
 * as 'gltf-directory' but sectors contain higher-detail geometry for nodes
 * specified in a PrioritizedNodes job.
 *
 * This UI allows switching between the standard and prioritized outputs
 * for the currently loaded model.
 */
export class PrioritizedNodesUI {
  private readonly _viewer: Cognite3DViewer<DataSourceType>;

  private readonly _modelId: number;
  private readonly _revisionId: number;

  private _currentModel: CogniteCadModel;
  private _isPrioritized: boolean = false;
  private readonly _onModelSwapped: (newModel: CogniteCadModel) => void;

  constructor(
    uiFolder: dat.GUI,
    _client: CogniteClient,
    viewer: Cognite3DViewer<DataSourceType>,
    mainModel: CogniteCadModel,
    onModelSwapped?: (newModel: CogniteCadModel) => void
  ) {
    this._viewer = viewer;
    this._currentModel = mainModel;
    this._modelId = mainModel.modelId;
    this._revisionId = mainModel.revisionId;
    this._onModelSwapped = onModelSwapped ?? (() => {});

    this.createUI(uiFolder);
  }

  private createUI(folder: dat.GUI): void {
    const state = {
      status: 'Standard output loaded'
    };

    const statusController = folder.add(state, 'status').name('Status');
    statusController.domElement.style.pointerEvents = 'none';

    const updateStatus = (msg: string) => {
      state.status = msg;
      statusController.updateDisplay();
    };

    const actions = {
      loadPrioritized: async () => {
        if (this._isPrioritized) {
          updateStatus('Already using prioritized output');
          return;
        }
        try {
          updateStatus('Loading prioritized output...');
          await this.replaceModel('gltf-prioritized-nodes-directory');
          this._isPrioritized = true;
          updateStatus('Prioritized output loaded');
        } catch (e: any) {
          updateStatus(`Error: ${e.message}`);
          console.error('Failed to load prioritized output:', e);
        }
      },

      revertToStandard: async () => {
        if (!this._isPrioritized) {
          updateStatus('Already using standard output');
          return;
        }
        try {
          updateStatus('Reverting to standard output...');
          await this.replaceModel(undefined);
          this._isPrioritized = false;
          updateStatus('Standard output loaded');
        } catch (e: any) {
          updateStatus(`Error: ${e.message}`);
          console.error('Failed to revert:', e);
        }
      }
    };

    folder.add(actions, 'loadPrioritized').name('Load prioritized output');
    folder.add(actions, 'revertToStandard').name('Revert to standard');
  }

  private async replaceModel(outputFormat: string | undefined): Promise<void> {
    this._viewer.removeModel(this._currentModel);

    const newModel = await this._viewer.addCadModel({
      modelId: this._modelId,
      revisionId: this._revisionId,
      outputFormat
    });

    this._currentModel = newModel;
    this._viewer.loadCameraFromModel(newModel);
    this._onModelSwapped(newModel);
  }
}
