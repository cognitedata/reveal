/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { SectorNode } from '../datamodels/cad/sector/SectorNode';
import { Cognite3DModel } from '../public/migration/Cognite3DModel';

import { Cognite3DViewer } from '../public/migration/Cognite3DViewer';
import { assertNever } from '../utilities';

import { Cognite3DViewerToolBase } from './Cognite3DViewerToolBase';

export type DebugLoadedSectorsToolOptions = {
  lodLevels?: 'all' | 'simple' | 'detailed';
  colorBy?: 'depth' | 'lod';
  leafsOnly?: boolean;
};

export class DebugLoadedSectorsTool extends Cognite3DViewerToolBase {
  private readonly _boundingBoxes = new THREE.Group();
  private readonly _viewer: Cognite3DViewer;
  private _options: Required<DebugLoadedSectorsToolOptions>;
  private _model?: Cognite3DModel;

  constructor(viewer: Cognite3DViewer, options: DebugLoadedSectorsToolOptions = {}) {
    super();
    this._viewer = viewer;
    this._options = { lodLevels: 'all', colorBy: 'lod', leafsOnly: false, ...options };
    this._viewer.addObject3D(this._boundingBoxes);
    this.setOptions(options);
  }

  setOptions(options: DebugLoadedSectorsToolOptions) {
    this._options = { lodLevels: 'all', colorBy: 'lod', leafsOnly: false, ...options };
  }

  dispose() {
    this._viewer.removeObject3D(this._boundingBoxes);
  }

  showSectorBoundingBoxes(model: Cognite3DModel) {
    this._model = model;
    this.updateBoundingBoxes();
  }

  private updateBoundingBoxes() {
    this._boundingBoxes.clear();
    if (this._model === undefined) {
      return;
    }
    this._model.getModelTransformation(this._boundingBoxes.matrix);
    this._model.cadNode.traverse(node => {
      if (isSectorNode(node)) {
        const sectorNode = node as SectorNode;
        if (isLoaded(sectorNode)) {
          if (this._options.leafsOnly && !isLeaf(sectorNode)) {
            return;
          }

          const bboxNode = this.createBboxNodeFor(sectorNode);
          this._boundingBoxes.add(bboxNode);
        }
      }
    });

    this._viewer.forceRerender();
  }

  private createBboxNodeFor(node: SectorNode) {
    const options = this._options;
    function determineColor() {
      switch (options.colorBy) {
        case 'depth':
          return Colors.red;
        case 'lod':
          return isSimple(node) ? Colors.yellow : Colors.green;
        default:
          assertNever(options.colorBy);
      }
    }
    const bbox = new THREE.Box3().setFromObject(node);
    const color = determineColor();
    return new THREE.Box3Helper(bbox, color);
  }
}

const Colors = {
  green: new THREE.Color('#00ff00'),
  yellow: new THREE.Color('yellow'),
  red: new THREE.Color('red')
};

function isSectorNode(node: THREE.Object3D) {
  return node.name.match(/^Sector \d+$/);
}

function isLoaded(node: SectorNode) {
  return node.group !== undefined ? node.group.children.some(x => (x as THREE.Mesh).isMesh) : false;
}

function isSimple(node: SectorNode) {
  debugger;
  return node.group !== undefined ? node.group.name.match(/^Quads \d+$/) : false;
}

function isLeaf(node: SectorNode) {
  return !node.children.some(x => isSectorNode(x));
}
