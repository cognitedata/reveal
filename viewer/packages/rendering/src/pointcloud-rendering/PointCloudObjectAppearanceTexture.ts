/*!
 * Copyright 2022 Cognite AS
 */

import { generateDataTexture } from './texture-generation';

import * as THREE from 'three';
import type { CompletePointCloudAppearance, StyledPointCloudVolumeCollection } from '@reveal/pointcloud-styling';
import { DefaultPointCloudAppearance, isPointCloudObjectCollection } from '@reveal/pointcloud-styling';
import type { PointCloudObjectIdMaps } from './PointCloudObjectIdMaps';
import type { DataSourceType } from '@reveal/data-providers';
import type { DMInstanceKey } from '@reveal/utilities';
import { dmInstanceRefToKey, createUint8View } from '@reveal/utilities';

export class PointCloudObjectAppearanceTexture {
  private readonly _objectStyleTexture: THREE.DataTexture;
  private _needsReconstruction: boolean = true;

  private readonly _styledObjectSets: {
    collection: StyledPointCloudVolumeCollection<DataSourceType>;
    importance: number;
  }[] = [];

  private _defaultAppearance: CompletePointCloudAppearance = { ...DefaultPointCloudAppearance };

  private readonly _width: number;
  private readonly _height: number;

  private _annotationIdsToObjectId: Map<number | DMInstanceKey, number> | undefined;

  constructor(width: number, height: number) {
    this._objectStyleTexture = generateDataTexture(width, height, new THREE.Color(0x0), 0x01); // Initialize with visibility bit set

    this._width = width;
    this._height = height;
  }

  setObjectsMaps(objectsMaps: PointCloudObjectIdMaps): void {
    this._annotationIdsToObjectId = objectsMaps.annotationToObjectIds;
  }

  private appearanceToRgba(appearance: CompletePointCloudAppearance): [number, number, number, number] {
    const realAppearance = { ...DefaultPointCloudAppearance, ...appearance };
    const alpha = appearance.visible ? 1 << 0 : 0;
    const colorBytes = realAppearance.color.toArray().map(c => Math.round(c * 255)) as [number, number, number];
    return [...colorBytes, alpha];
  }

  private setObjectStyle(objectId: number, appearance: CompletePointCloudAppearance): void {
    const rawData = this._objectStyleTexture.image.data;
    if (!rawData) {
      throw new Error('Point cloud object style texture data is not initialized');
    }
    const data = createUint8View(rawData);

    const styleData = this.appearanceToRgba(appearance);
    data.set(styleData, 4 * objectId);
  }

  private setObjectCollectionStyle(styledObjectSet: StyledPointCloudVolumeCollection<DataSourceType>): void {
    if (!this._annotationIdsToObjectId) {
      throw new Error('Annotation ID to Object ID map not initialized');
    }

    const objectCollection = styledObjectSet.objectCollection;

    const applyStyle = (transformedObjectId: number | DMInstanceKey) => {
      const objectId = this._annotationIdsToObjectId?.get(transformedObjectId);
      if (objectId === undefined) {
        throw new Error('Could not find corresponding object ID for ' + transformedObjectId);
      }
      this.setObjectStyle(objectId, styledObjectSet.style);
    };

    if (isPointCloudObjectCollection(objectCollection)) {
      for (const annotationId of objectCollection.getAnnotationIds()) {
        applyStyle(annotationId);
      }
    } else {
      for (const instanceRef of objectCollection.getDataModelInstanceRefs()) {
        applyStyle(dmInstanceRefToKey(instanceRef));
      }
    }
  }

  private resetTexture(): void {
    const rawData = this._objectStyleTexture.image.data;
    if (!rawData) {
      throw new Error('Point cloud object style texture data is not initialized');
    }
    const styleData = this.appearanceToRgba(this._defaultAppearance);

    for (let i = 0; i < this._width * this._height; i++) {
      createUint8View(rawData).set(styleData, 4 * i);
    }
  }

  onBeforeRender(): void {
    if (this._needsReconstruction) {
      this.resetTexture();
      for (const styledCollection of this._styledObjectSets) {
        this.setObjectCollectionStyle(styledCollection.collection);
      }

      this._objectStyleTexture.needsUpdate = true;
      this._needsReconstruction = false;
    }
  }

  assignStyledObjectSet(styledCollection: StyledPointCloudVolumeCollection<DataSourceType>, importance: number): void {
    const ind = this._styledObjectSets.findIndex(
      s => s.collection.objectCollection === styledCollection.objectCollection
    );

    if (ind !== -1) {
      this._styledObjectSets[ind].collection.style = styledCollection.style;
      this._styledObjectSets[ind].importance = importance;
    } else {
      this._styledObjectSets.push({ importance, collection: styledCollection });
    }

    this._styledObjectSets.sort(
      ({ importance: importance0 }, { importance: importance1 }) => importance0 - importance1
    );

    this._needsReconstruction = true;
  }

  removeStyledObjectSet(collection: StyledPointCloudVolumeCollection<DataSourceType>['objectCollection']): void {
    const ind = this._styledObjectSets.findIndex(s => s.collection.objectCollection === collection);
    if (ind !== -1) {
      this._styledObjectSets.splice(ind, 1);
    }

    this._needsReconstruction = true;
  }

  removeAllStyledObjectSets(): void {
    this._styledObjectSets.splice(0);
    this._needsReconstruction = true;
  }

  set defaultAppearance(appearance: CompletePointCloudAppearance) {
    this._defaultAppearance = { ...appearance };
    this._needsReconstruction = true;
  }

  get defaultAppearance(): CompletePointCloudAppearance {
    return this._defaultAppearance;
  }

  get objectStyleTexture(): THREE.DataTexture {
    return this._objectStyleTexture;
  }
}
