import * as dat from 'dat.gui';
import { Cognite3DModel } from "@cognite/reveal";
import { CogniteClient, Node3D } from "@cognite/sdk";

export class InspectNodeUI {
  private readonly _uiFolder: dat.GUI;
  private readonly _uiSubFolders: dat.GUI[] = [];
  private readonly _sdk: CogniteClient;

  constructor(uiFolder: dat.GUI, sdk: CogniteClient) {
    this._uiFolder = uiFolder;
    this._sdk = sdk;
  }

  async inspectNode(model: Cognite3DModel, treeIndex: number): Promise<void> {
    this.clearUi();

    const nodeId = await model.mapTreeIndexToNodeId(treeIndex);
    const nodes = await this._sdk.revisions3D.list3DNodeAncestors(model.modelId, model.revisionId, nodeId).autoPagingToArray();
    
    if (nodes.length === 0) {
      this.createNoNodes();
    }

    for (const node of nodes) {
      const nodeUi = this._uiFolder.addFolder(`${node.name} [depth=${node.depth}]`);
      this.registerUiFolder(nodeUi);
      this.createNodePropertiesFolder(node, nodeUi);
    }
  }
  
  private createNodePropertiesFolder(node: Node3D, nodeUi: dat.GUI) {
    nodeUi.add(node, 'treeIndex');
    nodeUi.add(node, 'subtreeSize');

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