/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { Cognite3DViewer, Cognite3DModel } from '@reveal/core';
import { LevelOfDetail, SectorNode } from '@reveal/core/cad';

import { Cognite3DViewerToolBase } from './Cognite3DViewerToolBase';
import { assertNever } from '@reveal/utilities';

export type DebugLoadedSectorsToolOptions = {
  showSimpleSectors?: boolean;
  showDetailedSectors?: boolean;
  showDiscardedSectors?: boolean;
  colorBy?: 'depth' | 'lod' | 'loadedTimestamp' | 'drawcalls' | 'random';
  leafsOnly?: boolean;
  sectorPathFilterRegex?: string;
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
    this._viewer.removeObject3D(this._boundingBoxes);
  }

  showSectorBoundingBoxes(model: Cognite3DModel): void {
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

    this._viewer.requestRedraw();
  }

  private isSectorAcceptedByCurrentFilter(node: SectorNode): boolean {
    const accepted = new RegExp(this._options.sectorPathFilterRegex).test(node.sectorPath);
    return accepted;
  }

  private createBboxNodeFor(node: SectorNode, allSelectedNodes: SectorNode[]) {
    const options = this._options;
    const sectorScene = this._model!.cadNode.sectorScene;

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
        case 'drawcalls': {
          const [minDrawCalls, maxDrawCalls] = allSelectedNodes.reduce(
            ([min, max], x) => {
              const sector = sectorScene.getSectorById(x.sectorId)!;
              return [Math.min(min, sector.estimatedDrawCallCount), Math.max(max, sector.estimatedDrawCallCount)];
            },
            [Infinity, -Infinity]
          );
          const sector = sectorScene.getSectorById(node.sectorId)!;
          const s = (sector.estimatedDrawCallCount - minDrawCalls) / (maxDrawCalls - minDrawCalls);
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
