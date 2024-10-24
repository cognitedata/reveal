/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudObjectIdMaps } from './pointcloud-rendering/PointCloudObjectIdMaps';
import { PointCloudMaterial } from './pointcloud-rendering';
import { PointCloudMaterialParameters } from './render-passes/types';
import { Plane } from 'three';

export class PointCloudMaterialManager {
  private readonly _modelsMaterialsMap: Map<symbol, PointCloudMaterial> = new Map();

  addModelMaterial(modelIdentifier: symbol, objectIdMaps: PointCloudObjectIdMaps): void {
    this._modelsMaterialsMap.set(modelIdentifier, new PointCloudMaterial({ objectsMaps: objectIdMaps }));
  }

  removeModelMaterial(modelIdentifier: symbol): void {
    // Return when no point cloud material to remove.
    if (this._modelsMaterialsMap.size < 1) {
      return;
    }

    const material = this._modelsMaterialsMap.get(modelIdentifier);

    if (material) {
      material.dispose();
    } else {
      throw new Error(`Model identifier: ${modelIdentifier.toString()} not found`);
    }

    this._modelsMaterialsMap.delete(modelIdentifier);
  }

  getModelMaterial(modelIdentifier: symbol): PointCloudMaterial {
    const material = this._modelsMaterialsMap.get(modelIdentifier);
    if (material === undefined) {
      throw new Error(`Model ${modelIdentifier.toString()} has not been added to PointCloudMaterialManager`);
    }

    return material;
  }

  initializeClippingPlanesForPointCloud(modelIdentifier: symbol, clippingPlanes: Plane[]): void {
    const material = this.getModelMaterial(modelIdentifier);

    material.clipping = true;
    material.clipIntersection = false;
    material.clippingPlanes = [...clippingPlanes];

    material.defines = {
      ...material.defines,
      NUM_CLIPPING_PLANES: clippingPlanes.length,
      UNION_CLIPPING_PLANES: 0
    };
  }

  setModelsMaterialParameters(materialParameters: PointCloudMaterialParameters | undefined): void {
    if (materialParameters) {
      this._modelsMaterialsMap.forEach(material => {
        this.setMaterialParameters(material, materialParameters);
      });
    }
  }

  setMaterialParameters(material: PointCloudMaterial, parameters: PointCloudMaterialParameters): void {
    for (const prop of Object.entries(parameters)) {
      try {
        //@ts-expect-error
        material[prop[0]] = prop[1];
      } catch {
        console.error(`Undefined point cloud material property: ${prop[0]}`);
      }
    }
  }

  dispose(): void {
    this._modelsMaterialsMap.forEach(material => {
      material.dispose();
    });
    this._modelsMaterialsMap.clear();
  }
}
