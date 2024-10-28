import * as THREE from 'three';
import { Cognite3DViewer, DataSourceType } from '@cognite/reveal';
import dat from 'dat.gui';

import {
  CogniteCadModel,
  NodeAppearance,
  DefaultNodeAppearance,
  TreeIndexNodeCollection,
  NumericRange,
  NodeOutlineColor,
  PropertyFilterNodeCollection
} from '@cognite/reveal';
import { CogniteClient, Viewer3DAPI } from '@cognite/sdk';

type Mutable<T> = { -readonly [P in keyof T]: T[P] };
interface DefaultNodeAppearanceByKeys {
  [key: string]: NodeAppearance;
}

// Names of keys in NodeOutlineColor where index corresponds to enum value
const nodeOutlineColorValues = ['NoOutline', 'White', 'Black', 'Cyan', 'Blue', 'Green', 'Red', 'Orange'];

export class NodeStylingUI {
  private readonly _client: CogniteClient;
  private readonly _model: CogniteCadModel;
  private readonly _viewer: Cognite3DViewer<DataSourceType>;
  private readonly _areaHelpers: THREE.Object3D[] = [];

  constructor(
    uiFolder: dat.GUI,
    client: CogniteClient,
    viewer: Cognite3DViewer<DataSourceType>,
    model: CogniteCadModel
  ) {
    this._model = model;
    this._client = client;
    this._viewer = viewer;

    this.createByTreeIndexUi(uiFolder.addFolder('By tree index'));
    this.createByNodePropertyUi(uiFolder.addFolder('By node property'));
    this.createDefaultStylingUi(uiFolder.addFolder('Default styling'));

    const actions = {
      removeLastAdded: () => this.removeMostImportantCollection(),
      removeFirstAdded: () => this.removeLeastImportantCollection(),
      resetStyling: () => this.resetStyling()
    };
    uiFolder.add(actions, 'removeFirstAdded').name('Remove least important');
    uiFolder.add(actions, 'removeLastAdded').name('Remove most important');
    uiFolder.add(actions, 'resetStyling').name('Reset styling');
  }

  removeLeastImportantCollection(): void {
    const first = this._model.styledNodeCollections.at(0);
    if (first !== undefined) {
      this._model.unassignStyledNodeCollection(first.nodeCollection);
    }
  }

  removeMostImportantCollection(): void {
    const last = this._model.styledNodeCollections.at(-1);
    if (last !== undefined) {
      this._model.unassignStyledNodeCollection(last.nodeCollection);
    }
  }

  resetStyling(): void {
    this._areaHelpers.forEach(areaHelper => this._viewer.removeObject3D(areaHelper));
    this._areaHelpers.splice(0);
    this._model.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
    this._model.removeAllStyledNodeCollections();
  }

  private createByTreeIndexUi(ui: dat.GUI) {
    const state = { from: 0, count: 1, importance: 0 };
    const createAppearanceCb = this.createNodeAppearanceUi(ui, DefaultNodeAppearance.Highlighted);
    const actions = {
      apply: () => {
        const appearance = createAppearanceCb();
        const nodes = new TreeIndexNodeCollection(new NumericRange(state.from, state.count));
        this._model.assignStyledNodeCollection(nodes, appearance, state.importance);
      }
    };
    ui.add(state, 'from', 0, this._model.nodeCount, 1).name('First tree index');
    ui.add(state, 'count', 1, this._model.nodeCount, 1).name('Node count');
    ui.add(state, 'importance', -100, 100, 1).name('Importance');
    ui.add(actions, 'apply').name('Apply');
  }

  private createByNodePropertyUi(ui: dat.GUI) {
    const state = { category: 'PDMS', property: 'Type', value: 'PIPE', showAreas: false, importance: 0 };
    const createAppearanceCb = this.createNodeAppearanceUi(ui, DefaultNodeAppearance.Highlighted);
    const actions = {
      apply: async () => {
        const appearance = createAppearanceCb();
        const nodes = new PropertyFilterNodeCollection(this._client, this._model, { requestPartitions: 10 });
        this._model.assignStyledNodeCollection(nodes, appearance, state.importance);
        await nodes.executeFilter({ [state.category]: { [state.property]: state.value } });
        if (state.showAreas) {
          for (const area of nodes.getAreas().areas()) {
            const boxHelper = new THREE.Box3Helper(area);
            this._viewer.addObject3D(boxHelper);
            this._areaHelpers.push(boxHelper);
          }
        }
      }
    };
    ui.add(state, 'category').name('Category');
    ui.add(state, 'property').name('Property');
    ui.add(state, 'value').name('Value');
    ui.add(state, 'showAreas').name('Show bounds of areas');
    ui.add(state, 'importance', -100, 100, 1).name('Importance');
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
    ui.add(state, 'preset', presets)
      .name('Apply preset')
      .onFinishChange(() => {
        applyPresetToAppearance(appearance, state.preset);
        updateState();
        ui.updateDisplay();
      });

    ui.add(appearance, 'visible').name('Visible');
    ui.add(appearance, 'renderGhosted').name('Ghosted');
    ui.add(appearance, 'renderInFront').name('In front');
    ui.addColor(state, 'color')
      .name('Node color')
      .onFinishChange(color => {
        appearance.color = new THREE.Color(color);
      });
    ui.add(state, 'outlineColor', nodeOutlineColorValues)
      .name('Outline')
      .onFinishChange(() => {
        appearance.outlineColor = stringToNodeOutlineColor(state.outlineColor);
      });
    ui.add(appearance, 'prioritizedForLoadingHint', 0, 10).name('Loading priority');

    return () => {
      const clone: NodeAppearance = { ...appearance };
      return clone;
    };
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

function colorToHexString(color: THREE.Color): string {
  return `#${color.getHexString()}`;
}
