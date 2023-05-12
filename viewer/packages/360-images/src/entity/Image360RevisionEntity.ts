/*!
 * Copyright 2022 Cognite AS
 */

import {
  Image360DataProvider,
  Image360FileDescriptor,
  Image360Descriptor,
  Image360Texture
} from '@reveal/data-providers';
import { Image360Revision } from './Image360Revision';
import { Image360VisualizationBox } from './Image360VisualizationBox';
import { AnnotationModel } from '@cognite/sdk';

import { ImageAnnotationObject } from '../annotation/ImageAnnotationObject';
import assert from 'assert';
import { Box3, Vector3 } from 'three';
import minBy from 'lodash/minBy';
import { Image360AnnotationAppearance } from '../annotation/types';

export class Image360RevisionEntity implements Image360Revision {
  private readonly _imageProvider: Image360DataProvider;
  private readonly _image360Descriptor: Image360Descriptor;
  private readonly _image360VisualzationBox: Image360VisualizationBox;
  private _previewTextures: Image360Texture[];
  private _fullResolutionTextures: Image360Texture[];
  private _onFullResolutionCompleted: Promise<void> | undefined;
  private _defaultAppearance: Image360AnnotationAppearance = {};

  private _annotations: ImageAnnotationObject[] | undefined = undefined;

  constructor(
    imageProvider: Image360DataProvider,
    image360Descriptor: Image360Descriptor,
    image360VisualzationBox: Image360VisualizationBox
  ) {
    this._imageProvider = imageProvider;
    this._image360Descriptor = image360Descriptor;
    this._image360VisualzationBox = image360VisualzationBox;
    this._previewTextures = [];
    this._fullResolutionTextures = [];
  }

  /**
   * The date of this revision. Undefined if the revison is undated.
   * @returns Date | undefined
   */
  get date(): Date | undefined {
    return this._image360Descriptor.timestamp ? new Date(this._image360Descriptor.timestamp) : undefined;
  }

  async getAnnotations(): Promise<ImageAnnotationObject[]> {
    if (this._annotations !== undefined) {
      return this._annotations;
    }

    return this.loadAndSetAnnotations();
  }

  intersectAnnotations(raycaster: THREE.Raycaster): ImageAnnotationObject | undefined {
    if (this._annotations === undefined) {
      return undefined;
    }

    const intersectedAnnotations = this._annotations.filter(a => raycaster.intersectObject(a.getObject()).length > 0);

    const smallestIntersectedBox = minBy(intersectedAnnotations, annotation => {
      const boundSize = new Box3().setFromObject(annotation.getObject()).getSize(new Vector3());
      return boundSize.x + boundSize.y + boundSize.z;
    });

    return smallestIntersectedBox;
  }

  /**
   * Loads the textures needed for the 360 image (6 faces).
   *
   * This will start the download of both low and full resolution textures and return one promise for when each texture set is ready.
   * If the low resolution images are completed first the full resolution download and texture loading will continue in the background,
   * and applyFullResolutionTextures can be called to apply full resolution textures to the image360VisualzationBox at a desired time.
   *
   * @returns lowResolutionCompleted A promise for when the low resolution images are done loading.
   * @returns fullResolutionCompleted A promise for when the full resolution images are done loading.
   */
  public loadTextures(abortSignal?: AbortSignal): {
    lowResolutionCompleted: Promise<void>;
    fullResolutionCompleted: Promise<void>;
  } {
    const lowResolutionCompleted = this.loadPreviewTextures(abortSignal);
    const fullResolutionCompleted = this.loadFullTextures(abortSignal);

    this._onFullResolutionCompleted = fullResolutionCompleted;

    return { lowResolutionCompleted, fullResolutionCompleted };
  }

  private async loadPreviewTextures(abortSignal?: AbortSignal): Promise<void> {
    const previewImageFiles = await this._imageProvider.getLowResolution360ImageFiles(
      this._image360Descriptor.faceDescriptors,
      abortSignal
    );
    if (this._fullResolutionTextures.length === 6) {
      return;
    }
    const previewTextures = await this._image360VisualzationBox.loadFaceTextures(previewImageFiles);
    this._previewTextures = previewTextures;
  }

  private async loadFullTextures(abortSignal?: AbortSignal): Promise<void> {
    const fullImageFiles = await this._imageProvider.get360ImageFiles(
      this._image360Descriptor.faceDescriptors,
      abortSignal
    );

    const textures = await this._image360VisualzationBox.loadFaceTextures(fullImageFiles);
    this._fullResolutionTextures = textures;
  }

  private async loadAndSetAnnotations(): Promise<ImageAnnotationObject[]> {
    const annotationData = await this._imageProvider.get360ImageAnnotations(this._image360Descriptor.faceDescriptors);

    const annotationObjects = annotationData
      .map(data => {
        const faceDescriptor = getAssociatedFaceDescriptor(data, this._image360Descriptor);
        return ImageAnnotationObject.createAnnotationObject(data, faceDescriptor.face);
      })
      .filter(isDefined);

    this._image360VisualzationBox.setAnnotations(annotationObjects);
    this._annotations = annotationObjects;
    this.propagateDefaultAppearanceToAnnotations();

    return annotationObjects;
  }

  public setDefaultAppearance(appearance: Image360AnnotationAppearance): void {
    this._defaultAppearance = appearance;
    this.propagateDefaultAppearanceToAnnotations();
  }

  private propagateDefaultAppearanceToAnnotations(): void {
    this._annotations?.forEach(a => a.setDefaultStyle(this._defaultAppearance));
  }

  /**
   * Clear the cached textures used by this revision.
   */
  public dispose(): void {
    this._previewTextures.forEach(t => t.texture.dispose());
    this._fullResolutionTextures.forEach(t => t.texture.dispose());
    this._previewTextures = [];
    this._fullResolutionTextures = [];
  }

  /**
   * Apply cached textures to the image360VisualzationBox.
   */
  public applyTextures(): void {
    if (this._fullResolutionTextures.length === 6) {
      this._image360VisualzationBox.loadImages(this._fullResolutionTextures);
      return;
    }
    if (this._previewTextures.length === 6) {
      this._image360VisualzationBox.loadImages(this._previewTextures);
      return;
    }
  }

  /**
   * Apply full resolution textures to the image360VisualzationBox.
   * This has no effect if full resolution has already been applied.
   */
  public async applyFullResolutionTextures(): Promise<void> {
    if (!this._onFullResolutionCompleted) return;

    try {
      await this._onFullResolutionCompleted;
      this._onFullResolutionCompleted = undefined;
      this._image360VisualzationBox.loadImages(this._fullResolutionTextures);
      if (this._previewTextures.length === 6) {
        this._previewTextures.forEach(t => t.texture.dispose());
        this._previewTextures = [];
      }
    } catch (e) {}
  }
}

function isDefined(obj: ImageAnnotationObject | undefined): obj is ImageAnnotationObject {
  return obj !== undefined && obj.getObject !== undefined;
}

function getAssociatedFaceDescriptor(
  annotation: AnnotationModel,
  imageDescriptors: Image360Descriptor
): Image360FileDescriptor {
  const fileDescriptors = imageDescriptors.faceDescriptors.filter(
    desc => desc.fileId === annotation.annotatedResourceId
  );

  assert(fileDescriptors.length !== 0);

  return fileDescriptors[0];
}
