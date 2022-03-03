/*!
 * Copyright 2022 Cognite AS
 */

import { CadNode } from './sector/CadNode';
import { RootSectorNode, LevelOfDetail, SectorNode } from '@reveal/cad-parsers';

import { CadMaterialManager, SceneComponentsProvider, NodeTypeExistences } from '@reveal/rendering';

import * as THREE from 'three';

export class CadSceneComponentsProvider implements SceneComponentsProvider {
  private readonly _originalScene: THREE.Scene;
  private readonly _cadScene: THREE.Scene;
  private readonly _normalScene: THREE.Scene;
  private readonly _inFrontScene: THREE.Scene;
  private readonly _rootSectorNodeBuffer: Set<[RootSectorNode, CadNode]> = new Set();

  private readonly _materialManager: CadMaterialManager;

  private readonly _normalSceneBuilder: TemporarySceneBuilder;
  private readonly _inFrontSceneBuilder: TemporarySceneBuilder;

  private _hasDismantledOriginalScene: boolean = false;
  private _hasPreparedNormalScene: boolean = false;
  private _hasPreparedInFrontScene: boolean = false;

  constructor(materialManager: CadMaterialManager, originalScene: THREE.Scene) {
    this._materialManager = materialManager;

    this._originalScene = originalScene;

    this._cadScene = new THREE.Scene();
    this._cadScene.autoUpdate = false;

    this._normalScene = new THREE.Scene();
    this._normalScene.autoUpdate = false;

    this._inFrontScene = new THREE.Scene();
    this._inFrontScene.autoUpdate = false;

    this._normalSceneBuilder = new TemporarySceneBuilder(this._normalScene);
    this._inFrontSceneBuilder = new TemporarySceneBuilder(this._inFrontScene);
  }

  public splitScene(): NodeTypeExistences {
    if (this._hasDismantledOriginalScene) {
      throw Error('Called onBeforeRender twice without calling onAfterRender inbetween');
    }

    // Move CadNodes from original scene
    this.transferCadNodesToCadScene(this._originalScene);

    const nodeExistences = this.splitToScenes();

    this._hasDismantledOriginalScene = true;

    return nodeExistences;
  }

  public restoreScene(): void {
    // Move CadNodes back into original scene
    this.restoreCadNodes();
    this._hasDismantledOriginalScene = false;
  }

  public getCustomScene(): THREE.Scene {
    if (!this._hasDismantledOriginalScene) {
      throw Error('Need to call "splitScene" for scenes te be available');
    }

    return this._originalScene;
  }

  public prepareNormalScene(): void {
    if (this._hasPreparedNormalScene) {
      throw Error('NormalScene already prepared');
    }

    this._hasPreparedNormalScene = true;

    this._normalSceneBuilder.populateTemporaryScene();
  }

  public prepareInFrontScene(): void {
    if (this._hasPreparedInFrontScene) {
      throw Error('InFrontScene alrady prepared');
    }

    this._hasPreparedInFrontScene = true;

    this._inFrontSceneBuilder.populateTemporaryScene();
  }

  public getCadScene(): THREE.Scene {
    if (this._hasPreparedNormalScene || this._hasPreparedInFrontScene) {
      throw Error("Can't get CAD scene when other scene components are prepared");
    }
    return this._cadScene;
  }

  public getNormalScene(): THREE.Scene {
    if (!this._hasPreparedNormalScene) {
      throw Error('Has not prepared normal scene');
    }

    return this._normalScene;
  }

  public getInFrontScene(): THREE.Scene {
    if (!this._hasPreparedInFrontScene) {
      throw Error('Has not prepared inFront scene');
    }

    return this._inFrontScene;
  }

  public getGhostScene(): THREE.Scene {
    // Ghosted elements are never moved from _cadScene
    return this._cadScene;
  }

  public restoreNormalScene(): void {
    if (!this._hasPreparedNormalScene) {
      throw Error('Normal scene was not prepared');
    }

    this._normalSceneBuilder.restoreOriginalScene();
    this._hasPreparedNormalScene = false;
  }

  public restoreInFrontScene(): void {
    if (!this._hasPreparedInFrontScene) {
      throw Error('InFront scene was not prepared');
    }

    this._inFrontSceneBuilder.restoreOriginalScene();
    this._hasPreparedInFrontScene = false;
  }

  private transferCadNodesToCadScene(fromScene: THREE.Scene): void {
    const objectStack: THREE.Object3D[] = [fromScene];

    let count = 0;

    while (objectStack.length > 0) {
      const element = objectStack.pop()!;
      if (element instanceof RootSectorNode) {
        const cadNode = element.parent! as CadNode;
        if (cadNode.visible) {
          if (cadNode.parent !== fromScene && cadNode.parent !== null && cadNode.parent.parent !== fromScene) {
            throw new Error('CadNode must be put at scene root');
          }

          count++;

          this._cadScene.add(element);
          this._rootSectorNodeBuffer.add([element, cadNode]);
        }
      } else if (!(element instanceof THREE.Group)) {
        objectStack.push(...element.children);
      }
    }
  }

  private restoreCadNodes() {
    this._rootSectorNodeBuffer.forEach(p => {
      p[1].add(p[0]);
    });
    this._rootSectorNodeBuffer.clear();
  }

  private getElementExistenceInformation(): NodeTypeExistences {
    const result: NodeTypeExistences = { back: false, inFront: false, ghost: false };

    // Determine what rendering stages will be active
    this._rootSectorNodeBuffer.forEach(rootSectorNodeData => {
      const cadNode: CadNode = rootSectorNodeData[1];

      const backSet = this._materialManager.getModelBackTreeIndices(cadNode.cadModelMetadata.modelIdentifier);
      const infrontSet = this._materialManager.getModelInFrontTreeIndices(cadNode.cadModelMetadata.modelIdentifier);
      const ghostSet = this._materialManager.getModelGhostedTreeIndices(cadNode.cadModelMetadata.modelIdentifier);
      const hasBackElements = backSet.count > 0;
      const hasInFrontElements = infrontSet.count > 0;
      const hasGhostElements = ghostSet.count > 0;
      result.back = result.back || hasBackElements;
      result.inFront = result.inFront || hasInFrontElements;
      result.ghost = result.ghost || hasGhostElements;
    });

    return result;
  }

  setVisibilityOfSimpleSectors(visibility: boolean): void {
    this._originalScene.traverse(x => {
      if (x instanceof SectorNode && x.levelOfDetail === LevelOfDetail.Simple) {
        x.visible = visibility;
      }
    });
  }

  private splitToScenes(): NodeTypeExistences {
    const nodeExistences = this.getElementExistenceInformation();

    // Split scenes based on what render stages we need
    this._rootSectorNodeBuffer.forEach(rootSectorNodeData => {
      const root: RootSectorNode = rootSectorNodeData[0];
      const cadNode: CadNode = rootSectorNodeData[1];

      const backSet = this._materialManager.getModelBackTreeIndices(cadNode.cadModelMetadata.modelIdentifier);
      const infrontSet = this._materialManager.getModelInFrontTreeIndices(cadNode.cadModelMetadata.modelIdentifier);

      const backRoot = new THREE.Object3D();
      backRoot.applyMatrix4(root.matrix);
      if (nodeExistences.back && nodeExistences.ghost) {
        this._normalScene.add(backRoot);
      }

      const infrontRoot = new THREE.Object3D();
      infrontRoot.applyMatrix4(root.matrix);
      if (nodeExistences.inFront) {
        this._inFrontScene.add(infrontRoot);
      }

      const objectStack: THREE.Object3D[] = [rootSectorNodeData[0]];
      while (objectStack.length > 0) {
        const element = objectStack.pop()!;
        const objectTreeIndices = element.userData.treeIndices as Map<number, number> | undefined;

        if (objectTreeIndices) {
          if (nodeExistences.inFront && infrontSet.hasIntersectionWith(objectTreeIndices)) {
            this._inFrontSceneBuilder.addElement(element, infrontRoot);
          }
          // Note! When we don't have any ghost, we use _cadScene to hold back objects, so no action required
          if (nodeExistences.back && !nodeExistences.ghost) {
          } else if (nodeExistences.ghost && backSet.hasIntersectionWith(objectTreeIndices)) {
            this._normalSceneBuilder.addElement(element, backRoot);
            // Use _cadScene to hold ghost objects (we assume we have more ghost objects than back objects)
          }

          // TODO 2020-09-18 larsmoa: A potential optimization to rendering is to avoid rendering the full
          // set of objects if most are hidden.
        } else {
          // Not a leaf, traverse children
          objectStack.push(...element.children);
        }
      }
    });

    return nodeExistences;
  }
}

/**
 * Holds parent-child relationship for a ThreeJS element in order to restore
 * the relationship after moving it temporarily.
 */
type Object3DStructure = {
  /**
   * Element described.
   */
  object: THREE.Object3D;
  /**
   * The previous parent of the element.
   */
  parent: THREE.Object3D;
  /**
   * The object that temporarily holds the elemnt.
   */
  sceneParent: THREE.Object3D;
};

class TemporarySceneBuilder {
  private readonly buffer: Object3DStructure[];
  private readonly temporaryScene: THREE.Scene;

  constructor(temporaryScene: THREE.Scene) {
    this.buffer = [];
    this.temporaryScene = temporaryScene;
  }

  addElement(element: THREE.Object3D, temporaryModelRootElement: THREE.Object3D): void {
    this.buffer.push({ object: element, parent: element.parent!, sceneParent: temporaryModelRootElement });
  }

  populateTemporaryScene(): void {
    this.buffer.forEach(x => x.sceneParent.add(x.object));
  }

  restoreOriginalScene(): void {
    this.buffer.forEach(p => {
      p.parent.add(p.object);
    });
    this.buffer.length = 0; // clear
    this.temporaryScene.remove(...this.temporaryScene.children);
  }
}
