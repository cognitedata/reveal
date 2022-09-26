/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

import { CadNode } from '..';
import {
  StreamingTestFixtureComponents,
  StreamingVisualTestFixture
} from '../../../visual-tests/test-fixtures/StreamingVisualTestFixture';

import { DebugLoadedSectorsTool, DebugLoadedSectorsToolOptions } from './DebugLoadedSectorsTool';

type SectorsStatistics = {
  insideSectors: number;
  maxSectorDepth: number;
  maxSectorDepthOfInsideSectors: number;
  simpleSectorCount: number;
  detailedSectorCount: number;
  culledCount: number;
  forceDetailedSectorCount: number;
  downloadSizeMb: number;
};

type SectorsGuiState = {
  options: DebugLoadedSectorsToolOptions;
  statistics: SectorsStatistics;
  tool: DebugLoadedSectorsTool;
};

export default class CadDebugger extends StreamingVisualTestFixture {
  guiState!: SectorsGuiState;
  guiActions!: {
    showSectorBoundingBoxes: () => void;
    showBoundsForAllGeometries: () => void;
  };

  public setup(testFixtureComponents: StreamingTestFixtureComponents): Promise<void> {
    const { model, sceneHandler } = testFixtureComponents;

    if (!(model.geometryNode instanceof CadNode)) {
      return Promise.resolve();
    }

    this.setupGui(model.geometryNode, sceneHandler.scene);

    this.guiActions.showSectorBoundingBoxes();

    return Promise.resolve();
  }

  private async setupGui(cadNode: CadNode, scene: THREE.Scene) {
    this.guiState = {
      options: {
        showSimpleSectors: true,
        showDetailedSectors: true,
        showDiscardedSectors: true,
        colorBy: 'lod',
        leafsOnly: false,
        sectorPathFilterRegex: '^.*/$'
      },
      statistics: {
        insideSectors: 0,
        maxSectorDepth: 0,
        maxSectorDepthOfInsideSectors: 0,
        simpleSectorCount: 0,
        detailedSectorCount: 0,
        culledCount: 0,
        forceDetailedSectorCount: 0,
        downloadSizeMb: 0
      },
      tool: new DebugLoadedSectorsTool(scene)
    };

    const guiState = this.guiState;

    this.guiActions = {
      showSectorBoundingBoxes: () => {
        const { tool, options } = this.guiState;
        tool.setOptions(options);
        tool.showSectorBoundingBoxes(scene);
      },
      showBoundsForAllGeometries: () => {
        this.showBoundsForAllGeometries(cadNode, scene);
      }
    };

    const debugSectorsGui = this.gui.addFolder('Loaded sectors');

    debugSectorsGui
      .add(guiState.options, 'colorBy', ['lod', 'depth', 'loadedTimestamp', 'drawcalls', 'random'])
      .name('Color by');
    debugSectorsGui.add(guiState.options, 'leafsOnly').name('Leaf nodes only');
    debugSectorsGui.add(guiState.options, 'showSimpleSectors').name('Show simple sectors');
    debugSectorsGui.add(guiState.options, 'showDetailedSectors').name('Show detailed sectors');
    debugSectorsGui.add(guiState.options, 'showDiscardedSectors').name('Show discarded sectors');
    debugSectorsGui.add(guiState.options, 'sectorPathFilterRegex').name('Sectors path filter');
    debugSectorsGui.add(this.guiActions, 'showSectorBoundingBoxes').name('Show sectors');
    debugSectorsGui.add(this.guiActions, 'showBoundsForAllGeometries').name('Show geometry bounds');
    debugSectorsGui.add(guiState.statistics, 'insideSectors').name('# sectors@camera');
    debugSectorsGui.add(guiState.statistics, 'maxSectorDepthOfInsideSectors').name('Max sector depth@camera');
    debugSectorsGui.add(guiState.statistics, 'maxSectorDepth').name('Max sector tree depth');
    debugSectorsGui.add(guiState.statistics, 'simpleSectorCount').name('# simple sectors');
    debugSectorsGui.add(guiState.statistics, 'detailedSectorCount').name('# detailed sectors');
    debugSectorsGui.add(guiState.statistics, 'forceDetailedSectorCount').name('# force detailed sectors');
    debugSectorsGui.add(guiState.statistics, 'culledCount').name('# culled sectors');
    debugSectorsGui.add(guiState.statistics, 'downloadSizeMb').name('Download size (Mb)');
  }

  showBoundsForAllGeometries(node: CadNode, scene: THREE.Scene): void {
    const boxes = new THREE.Group();
    node.getModelTransformation(boxes.matrix);
    boxes.matrixWorldNeedsUpdate = true;

    node.traverse(x => {
      if (x instanceof THREE.Mesh) {
        const mesh = x;
        const geometry: THREE.BufferGeometry = mesh.geometry;

        if (geometry.boundingBox !== null) {
          const box = geometry.boundingBox.clone();
          box.applyMatrix4(mesh.matrixWorld);

          const boxHelper = new THREE.Box3Helper(box);
          boxes.add(boxHelper);
        }
      }
    });
    scene.add(boxes);
  }
}
