/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { LevelOfDetail, SectorNode } from '../../cad-parsers/';

import { assertNever } from '@reveal/utilities';

export type DebugLoadedSectorsToolOptions = {
  showSimpleSectors?: boolean;
  showDetailedSectors?: boolean;
  showDiscardedSectors?: boolean;
  colorBy?: 'depth' | 'lod' | 'loadedTimestamp' | 'random';
  leafsOnly?: boolean;
  sectorPathFilterRegex?: string;
};

export class DebugLoadedSectorsTool {
  private readonly _boundingBoxes = new THREE.Group();
  private readonly _scene: THREE.Scene;
  private _options: Required<DebugLoadedSectorsToolOptions>;
  private _model?: THREE.Object3D;

  constructor(scene: THREE.Scene, options: DebugLoadedSectorsToolOptions = {}) {
    this._scene = scene;
    this._scene.add(this._boundingBoxes);
    this._options = {} as any; // Force - it's set in setOptions
    this.setOptions(options);
  }

  setOptions(options: DebugLoadedSectorsToolOptions): void {
    this._options = {
      showDetailedSectors: true,
      showDiscardedSectors: false,
      showSimpleSectors: true,
      colorBy: 'lod',
      leafsOnly: false,
      sectorPathFilterRegex: '.*',
      ...options
    };
  }

  dispose(): void {
    this._scene.remove(this._boundingBoxes);
  }

  showSectorBoundingBoxes(model: THREE.Object3D): void {
    this._model = model;
    this.updateBoundingBoxes();
  }

  private updateBoundingBoxes() {
    this._boundingBoxes.clear();
    if (this._model === undefined) {
      return;
    }
    this._boundingBoxes.matrix = this._model.matrix;
    const shouldShowLod: boolean[] = [];
    shouldShowLod[LevelOfDetail.Discarded] = this._options.showDiscardedSectors;
    shouldShowLod[LevelOfDetail.Simple] = this._options.showSimpleSectors;
    shouldShowLod[LevelOfDetail.Detailed] = this._options.showDetailedSectors;

    const selectedSectorNodes: SectorNode[] = [];
    this._model.traverse(node => {
      if (isSectorNode(node)) {
        const sectorNode = node as SectorNode;

        if (
          this.isSectorAcceptedByCurrentFilter(sectorNode) &&
          shouldShowLod[sectorNode.levelOfDetail] &&
          (!this._options.leafsOnly || isLeaf(sectorNode))
        ) {
          selectedSectorNodes.push(sectorNode);
        }
      }
    });

    selectedSectorNodes.forEach(sectorNode => {
      const bboxNode = this.createBboxNodeFor(sectorNode, selectedSectorNodes);
      this._boundingBoxes.add(bboxNode);
    });
    this._boundingBoxes.updateMatrixWorld(true);
  }

  private isSectorAcceptedByCurrentFilter(node: SectorNode): boolean {
    const accepted = new RegExp(this._options.sectorPathFilterRegex).test(node.sectorPath);
    return accepted;
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
        case 'random':
          return new THREE.Color().setHSL(Math.random(), 1.0, 0.5);

        // Note! The two next modes are horribly slow since we do this for every sector,
        // but since this is a debug tool we consider it OK
        case 'loadedTimestamp': {
          const nodesByTimestamp = [...allSelectedNodes].sort((a, b) => a.updatedTimestamp - b.updatedTimestamp);
          const indexOfNode = nodesByTimestamp.findIndex(x => x === node);
          const s = (nodesByTimestamp.length - 1 - indexOfNode) / Math.max(nodesByTimestamp.length - 1, 1);
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

function isSectorNode(node: THREE.Object3D): node is SectorNode {
  return node.name.match(/^Sector \d+$/) ? true : false;
}

function isLeaf(node: SectorNode) {
  return !node.children.some(x => isSectorNode(x));
}
