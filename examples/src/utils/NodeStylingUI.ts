import * as THREE from 'three';
import dat from 'dat.gui';

import { Cognite3DModel, NodeAppearance, DefaultNodeAppearance, TreeIndexNodeCollection, NumericRange, NodeOutlineColor, PropertyFilterNodeCollection } from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';

type Mutable<T> = { -readonly [P in keyof T]: T[P] };
interface DefaultNodeAppearanceByKeys {
   [key: string]: NodeAppearance
};

export class NodeStylingUI {
  private readonly _client: CogniteClient;
  private readonly _model: Cognite3DModel;

  constructor(uiFolder: dat.GUI, client: CogniteClient, model: Cognite3DModel) {
    this._model = model;
    this._client = client;

    this.createByTreeIndexUi(uiFolder.addFolder('By tree index'));
    this.createByNodePropertyUi(uiFolder.addFolder('By node property'));
    this.createDefaultStylingUi(uiFolder.addFolder('Default styling'));

    const actions = {
      removeLastAdded: () => this.removeLastAddedCollection(),
      removeFirstAdded: () => this.removeFirstAddedCollection(),
      resetStyling: () => this.resetStyling()
    };
    uiFolder.add(actions, 'removeFirstAdded').name('Remove first added');
    uiFolder.add(actions, 'removeLastAdded').name('Remove last added');
    uiFolder.add(actions, 'resetStyling').name('Reset styling');
  }

  removeFirstAddedCollection(): void {
    const [first] = this._model.styledNodeCollections;
    if (first !== undefined) {
      this._model.unassignStyledNodeCollection(first.nodeCollection);
    }
  }

  removeLastAddedCollection(): void {
    const [, last] = this._model.styledNodeCollections;
    if (last !== undefined) {
      this._model.unassignStyledNodeCollection(last.nodeCollection);
    }
  }

  resetStyling(): void {
    this._model.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
    this._model.removeAllStyledNodeCollections();
  }

  private createByTreeIndexUi(ui: dat.GUI) {
    const state = { from: 0, count: 1 };
    const createAppearanceCb = this.createNodeAppearanceUi(ui, DefaultNodeAppearance.Highlighted);
    const actions = {
      apply: () => {
        const appearance = createAppearanceCb();
        const nodes = new TreeIndexNodeCollection(new NumericRange(state.from, state.count));
        this._model.assignStyledNodeCollection(nodes, appearance)
      }
    };
    ui.add(state, 'from', 0, this._model.nodeCount, 1).name('First tree index');
    ui.add(state, 'count', 1, this._model.nodeCount, 1).name('Node count');
    ui.add(actions, 'apply').name('Apply');
  }

  private createByNodePropertyUi(ui: dat.GUI) {
    const state = { category: 'PDMS', property: 'Type', value: 'PIPE' };
    const createAppearanceCb = this.createNodeAppearanceUi(ui, DefaultNodeAppearance.Highlighted);
    const actions = {
      apply: () => {
        const appearance = createAppearanceCb();
        const nodes = new PropertyFilterNodeCollection(this._client, this._model, { requestPartitions: 10 });
        nodes.executeFilter({ [state.category]: { [state.property]: state.value } });
        this._model.assignStyledNodeCollection(nodes, appearance);
      }
    };
    ui.add(state, 'category').name('Category');
    ui.add(state, 'property').name('Property');
    ui.add(state, 'value').name('Value');
    ui.add(actions, 'apply').name('Apply');
  }

  private createDefaultStylingUi(ui: dat.GUI) {
    const createAppearanceCb = this.createNodeAppearanceUi(ui, DefaultNodeAppearance.Ghosted);
    const actions = { apply: () => {
      const appearance = createAppearanceCb();
      this._model.setDefaultNodeAppearance(appearance);
    }};
    ui.add(actions, 'apply').name('Apply');
  }

  private createNodeAppearanceUi(ui: dat.GUI, defaultAppearance: NodeAppearance = {}): () => NodeAppearance {
    const appearance = { ...DefaultNodeAppearance.Default, ...defaultAppearance } as Mutable<Required<NodeAppearance>>;
    const state = { 
      color: '',
      outlineColor: NodeOutlineColor.NoOutline,
      preset: ''
    };
    function resetState() {
      state.color = `#${new THREE.Color(appearance.color[0] / 255, appearance.color[1] / 255, appearance.color[2] / 255).getHexString()}`;
      state.outlineColor = NodeOutlineColor[appearance.outlineColor];
      state.preset = '';
    }
    resetState();

    const presets = ['Default', 'Hidden', 'Ghosted', 'Highlighted'];
    ui.add(state, 'preset', presets).name('Apply preset').onFinishChange(() => {
      const defaultNodeAppearances = DefaultNodeAppearance as DefaultNodeAppearanceByKeys;
      Object.assign(appearance, DefaultNodeAppearance.Default);
      Object.assign(appearance, defaultNodeAppearances[state.preset]);
      resetState();
      ui.updateDisplay();
    });

    ui.add(appearance, 'visible').name('Visible');
    ui.add(appearance, 'renderGhosted').name('Ghosted');
    ui.add(appearance, 'renderInFront').name('In front');
    ui.addColor(state, 'color').name('Node color').onChange(() => {
      const threeColor = new THREE.Color(state.color);
      appearance.color = [Math.floor(threeColor.r * 255), Math.floor(threeColor.g * 255), Math.floor(threeColor.b * 255)];
    });
    const outlineValues = Object.keys(NodeOutlineColor).filter(k => typeof NodeOutlineColor[k as any] !== "number").map(x => NodeOutlineColor[x])
    ui.add(state, 'outlineColor', outlineValues).name('Outline').onChange(() => {
      appearance.outlineColor = NodeOutlineColor[state.outlineColor] as NodeOutlineColor;
    });
    ui.add(appearance, 'prioritizedForLoadingHint', 0, 10).name('Loading priority');

    return () => {
      const clone: NodeAppearance = { ...appearance };
      return clone;
    }
  }
}