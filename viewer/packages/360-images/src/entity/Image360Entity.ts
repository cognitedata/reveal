/*!
 * Copyright 2022 Cognite AS
 */

import { DeviceDescriptor, SceneHandler } from '@reveal/utilities';
import { DataSourceType, Image360Provider } from '@reveal/data-providers';
import { Image360 } from './Image360';
import {
  Historical360ImageSet,
  Image360RevisionDescriptor,
  Image360RevisionId
} from '@reveal/data-providers/src/types';
import { Image360RevisionEntity } from './Image360RevisionEntity';
import minBy from 'lodash/minBy';
import { Image360VisualizationBox } from './Image360VisualizationBox';
import { ImageAnnotationObject } from '../annotation/ImageAnnotationObject';
import { Overlay3DIcon } from '@reveal/3d-overlays';
import { Image360AnnotationFilter } from '../annotation/Image360AnnotationFilter';
import { Color, Matrix4, type Raycaster, type Vector3 } from 'three';

import cloneDeep from 'lodash/cloneDeep';

export class Image360Entity<T extends DataSourceType> implements Image360<T> {
  private readonly _revisions: Image360RevisionEntity<T>[];
  private readonly _imageMetadata: Image360RevisionDescriptor<T>;
  private readonly _modelTransform: Matrix4;
  private readonly _worldTransform: Matrix4;
  private readonly _image360Icon: Overlay3DIcon;
  private readonly _image360VisualizationBox: Image360VisualizationBox;
  private _activeRevision: Image360RevisionEntity<T>;
  private _iconColor: Color | 'default' = 'default';
  private _originalIconY: number | undefined;

  /**
   * Get a copy of the model-to-world transformation matrix
   * of the given 360 image.
   * @returns model-to-world transform of the 360 Image
   */
  get transform(): Matrix4 {
    return this._worldTransform.clone();
  }

  /**
   * Get the icon that represents the 360
   * image during normal visualization.
   * @returns Image360Icon
   */
  get icon(): Overlay3DIcon {
    return this._image360Icon;
  }

  /**
   * The object containing the unit cube with the 360 images.
   * @returns Image360Visualization
   */
  get image360Visualization(): Image360VisualizationBox {
    return this._image360VisualizationBox;
  }

  /**
   * Get Id of 360 image entity.
   * @returns Station Id
   */
  get id(): Image360RevisionId<T> {
    return this._imageMetadata.id;
  }

  /**
   * Get label of 360 image entity.
   * @returns Station label
   * */
  get label(): string | undefined {
    return this._imageMetadata.label;
  }

  constructor(
    image360Metadata: Historical360ImageSet<T>,
    sceneHandler: SceneHandler,
    imageProvider: Image360Provider<T>,
    annotationFilterer: Image360AnnotationFilter,
    transform: Matrix4,
    icon: Overlay3DIcon,
    device: DeviceDescriptor
  ) {
    this._modelTransform = transform;
    this._worldTransform = transform.clone();
    this._image360Icon = icon;
    this._imageMetadata = image360Metadata;

    this._image360VisualizationBox = new Image360VisualizationBox(this._modelTransform, sceneHandler, device);
    this._image360VisualizationBox.visible = false;

    this._revisions = image360Metadata.imageRevisions.map(
      descriptor =>
        new Image360RevisionEntity<T>(imageProvider, descriptor, this._image360VisualizationBox, annotationFilterer)
    );
    this._activeRevision = this.getMostRecentRevision();
  }

  public setWorldTransform(matrix: Matrix4): void {
    this._worldTransform.copy(matrix).multiply(this._modelTransform);
    this._image360VisualizationBox.setWorldTransform(matrix);
  }

  /**
   * List all historical images for this entity.
   * @returns A list of available revisions.
   */
  public getRevisions(): Image360RevisionEntity<T>[] {
    return this._revisions;
  }

  /**
   * Get the revision that is currently loaded for this entry.
   * @returns Returns the active revision.
   */
  public getActiveRevision(): Image360RevisionEntity<T> {
    return this._activeRevision;
  }

  public setActiveRevision(revision: Image360RevisionEntity<T>): void {
    this._activeRevision = revision;
    this._activeRevision.applyTextures();
  }

  public applyFullResolutionTextures(): Promise<void> {
    return this._activeRevision.applyFullResolutionTextures();
  }

  public getMostRecentRevision(): Image360RevisionEntity<T> {
    return this._revisions[0];
  }

  /**
   * Get the revision closest to the provided date.
   * If all revisions are undated the first available revison is returned.
   */
  public getRevisionClosestToDate(date: Date): Image360RevisionEntity<T> {
    const dateAsNumber = date.getTime();
    const datedRevisions = this._revisions.filter(revision => revision.date !== undefined);
    const closestDatedRevision = minBy(datedRevisions, revision => Math.abs(revision.date!.getTime() - dateAsNumber));
    return closestDatedRevision ?? this.getMostRecentRevision();
  }

  public intersectAnnotations(raycaster: Raycaster): ImageAnnotationObject<T> | undefined {
    return this._activeRevision.intersectAnnotations(raycaster);
  }

  public get360ImageBoxIntersection(raycaster: Raycaster): { point: Vector3; normal: Vector3 } | undefined {
    return this._image360VisualizationBox.get360ImageBoxIntersection(raycaster);
  }

  public getEstimatedFloorWorldY(): number {
    return this._image360VisualizationBox.getEstimatedFloorWorldY();
  }

  /**
   * Moves the icon to the given floor Y height (world space).
   * Stores the original Y so it can be restored with `restoreIconFloorHeight()`.
   * Calling this again before restoring overwrites the stored original.
   */
  public adjustIconFloorHeight(floorY: number): void {
    if (this._originalIconY === undefined) {
      this._originalIconY = this._image360Icon.getPosition().y;
    }
    this._image360Icon.getPosition().y = floorY;
  }

  /**
   * Restores the icon to the Y position it had before `adjustIconFloorHeight()` was called.
   * No-op if `adjustIconFloorHeight()` has not been called.
   */
  public restoreIconFloorHeight(): void {
    if (this._originalIconY === undefined) return;
    this._image360Icon.getPosition().y = this._originalIconY;
    this._originalIconY = undefined;
  }

  /**
   * Drops the GPU resources for the 360 image
   */
  public unloadImage(): void {
    this._image360VisualizationBox.unloadImages();
  }

  public getIconColor(): Color | 'default' {
    return cloneDeep(this._iconColor);
  }

  public setIconColor(color: Color | 'default'): void {
    this._iconColor = color;
    this._image360Icon.setColor(color);
  }

  public activateAnnotations(): void {
    const setAndShowAnnotations = async () => {
      const annotations = await this._activeRevision.getAnnotations();

      this._image360VisualizationBox.setAnnotations(annotations);
      this._image360VisualizationBox.setAnnotationsVisibility(true);
    };

    setAndShowAnnotations();
  }

  public deactivateAnnotations(): void {
    this._image360VisualizationBox.setAnnotationsVisibility(false);
  }

  /**
   * @obvious
   */
  public dispose(): void {
    this.unloadImage();
    this._revisions.forEach(revision => revision.dispose());
    this._image360Icon.dispose();
  }
}
