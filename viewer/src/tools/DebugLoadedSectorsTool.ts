/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { LevelOfDetail } from '../datamodels/cad/sector/LevelOfDetail';

import { SectorNode } from '../datamodels/cad/sector/SectorNode';
import { Cognite3DModel } from '../public/migration/Cognite3DModel';

import { Cognite3DViewer } from '../public/migration/Cognite3DViewer';
import { assertNever } from '../utilities';

import { Cognite3DViewerToolBase } from './Cognite3DViewerToolBase';

export type DebugLoadedSectorsToolOptions = {
  showSimpleSectors?: boolean;
  showDetailedSectors?: boolean;
  showDiscardedSectors?: boolean;
  colorBy?: 'depth' | 'lod' | 'loadedTimestamp';
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
    this._viewer.addObject3D(this._boundingBoxes);
    this._options = {} as any; // Force - it's set in setOptions
    this.setOptions(options);
  }

  setOptions(options: DebugLoadedSectorsToolOptions) {
    this._options = {
      showDetailedSectors: true,
      showDiscardedSectors: false,
      showSimpleSectors: true,
      colorBy: 'lod',
      leafsOnly: false,
      ...options
    };
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
    const shouldShowLod: boolean[] = [];
    shouldShowLod[LevelOfDetail.Discarded] = this._options.showDiscardedSectors;
    shouldShowLod[LevelOfDetail.Simple] = this._options.showSimpleSectors;
    shouldShowLod[LevelOfDetail.Detailed] = this._options.showDetailedSectors;

    const selectedSectorNodes: SectorNode[] = [];
    this._model.cadNode.traverse(node => {
      if (isSectorNode(node)) {
        const sectorNode = node as SectorNode;

        if (shouldShowLod[sectorNode.levelOfDetail] && (!this._options.leafsOnly || isLeaf(sectorNode))) {
          selectedSectorNodes.push(sectorNode);
        }
      }
    });

    selectedSectorNodes.forEach(sectorNode => {
      const bboxNode = this.createBboxNodeFor(sectorNode, selectedSectorNodes);
      this._boundingBoxes.add(bboxNode);
    });
    this._boundingBoxes.updateMatrixWorld(true);

    this._viewer.forceRerender();
  }

  private createBboxNodeFor(node: SectorNode, allSelectedNodes: SectorNode[]) {
    const options = this._options;
    function determineColor() {
      switch (options.colorBy) {
        case 'depth': {
          const s = Math.min(1.0, node.depth / 8);
          return new THREE.Color(Colors.green).lerpHSL(Colors.red, s);
        }
        case 'lod': {
          switch (node.levelOfDetail) {
            case LevelOfDetail.Simple:
              return Colors.yellow;
            case LevelOfDetail.Detailed:
              return Colors.green;
            case LevelOfDetail.Discarded:
              return Colors.red;
            default:
              assertNever(node.levelOfDetail);
          }
        }
        case 'loadedTimestamp': {
          debugger;
          const timestampRange = allSelectedNodes.reduce(
            (v, p) => ({ min: Math.min(p.updatedTimestamp, v.min), max: Math.max(p.updatedTimestamp, v.max) }),
            { min: Infinity, max: -Infinity }
          );
          // Give more precision to recently loaded sectors
          const s =
            1.0 - Math.pow((node.updatedTimestamp - timestampRange.min) / (timestampRange.max - timestampRange.min), 4);
          return new THREE.Color(Colors.green).lerpHSL(Colors.red, s);
        }

        default:
          assertNever(options.colorBy);
      }
    }
    const color = determineColor();
    return new THREE.Box3Helper(node.bounds, color);
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

function isLeaf(node: SectorNode) {
  return !node.children.some(x => isSectorNode(x));
}
