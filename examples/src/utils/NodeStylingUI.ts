import * as THREE from 'three';
import dat from 'dat.gui';

import { Cognite3DModel, NodeAppearance, DefaultNodeAppearance, TreeIndexNodeCollection, NumericRange, NodeOutlineColor, PropertyFilterNodeCollection } from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';

type Mutable<T> = { -readonly [P in keyof T]: T[P] };
interface DefaultNodeAppearanceByKeys {
  [key: string]: NodeAppearance
};

// Names of keys in NodeOutlineColor where index corresponds to enum value
const nodeOutlineColorValues = [
  'NoOutline',
  'White',
  'Black',
  'Cyan',
  'Blue',
  'Green',
  'Red',
  'Orange'];

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
    const actions = {
      apply: () => {
        const appearance = createAppearanceCb();
        this._model.setDefaultNodeAppearance(appearance);
      }
    };
    ui.add(actions, 'apply').name('Apply');
  }

  private createNodeAppearanceUi(ui: dat.GUI, defaultAppearance: NodeAppearance = {}): () => NodeAppearance {
    const appearance = { ...DefaultNodeAppearance.Default, ...defaultAppearance } as Mutable<Required<NodeAppearance>>;
    const state = {
      color: '',
      outlineColor: nodeOutlineColorToString(NodeOutlineColor.NoOutline),
      preset: ''
    };
    function updateState() {
      state.color = colorToHexString(appearance.color);
      state.outlineColor = nodeOutlineColorToString(appearance.outlineColor);
      state.preset = '';
    }
    updateState();

    const presets = ['Default', 'Hidden', 'Ghosted', 'Highlighted'];
    ui.add(state, 'preset', presets).name('Apply preset').onFinishChange(() => {
      applyPresetToAppearance(appearance, state.preset);
      updateState();
      ui.updateDisplay();
    });

    ui.add(appearance, 'visible').name('Visible');
    ui.add(appearance, 'renderGhosted').name('Ghosted');
    ui.add(appearance, 'renderInFront').name('In front');
    ui.addColor(state, 'color').name('Node color').onFinishChange(color => {
      appearance.color = hexStringToColor(color);
    });
    ui.add(state, 'outlineColor', nodeOutlineColorValues).name('Outline').onFinishChange(() => {
      appearance.outlineColor = stringToNodeOutlineColor(state.outlineColor);
    });

    return () => {
      const clone: NodeAppearance = { ...appearance };
      return clone;
    }
  }
}

function applyPresetToAppearance(appearance: NodeAppearance, preset: string) {
  const defaultNodeAppearances = DefaultNodeAppearance as DefaultNodeAppearanceByKeys;
  Object.assign(appearance, DefaultNodeAppearance.Default);
  Object.assign(appearance, defaultNodeAppearances[preset]);
}

function stringToNodeOutlineColor(enumName: string): NodeOutlineColor {
  return nodeOutlineColorValues.indexOf(enumName) as NodeOutlineColor;
}

function nodeOutlineColorToString(color: NodeOutlineColor): string {
  return nodeOutlineColorValues[color as number];
}

function colorToHexString(color: [number, number, number]): string {
  return `#${new THREE.Color(color[0] / 255, color[1] / 255, color[2] / 255).getHexString()}`;
}

function hexStringToColor(hexColor: string): [number, number, number] {
  const threeColor = new THREE.Color(hexColor);
  return [
    Math.floor(threeColor.r * 255),
    Math.floor(threeColor.g * 255),
    Math.floor(threeColor.b * 255)];
}