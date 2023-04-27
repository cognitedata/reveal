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

export class Image360RevisionEntity implements Image360Revision {
  private readonly _imageProvider: Image360DataProvider;
  private readonly _image360Descriptor: Image360Descriptor;
  private readonly _image360VisualzationBox: Image360VisualizationBox;
  private _textures: Image360Texture[];
  private _onFullResolutionCompleted: Promise<void> | undefined;

  private _annotations: ImageAnnotationObject[] | undefined = undefined;

  constructor(
    imageProvider: Image360DataProvider,
    image360Descriptor: Image360Descriptor,
    image360VisualzationBox: Image360VisualizationBox
  ) {
    this._imageProvider = imageProvider;
    this._image360Descriptor = image360Descriptor;
    this._image360VisualzationBox = image360VisualzationBox;
    this._textures = [];
  }

  /**
   * The date of this revision. Undefined if the revison is undated.
   * @returns Date | undefined
   */
  get date(): Date | undefined {
    return this._image360Descriptor.timestamp ? new Date(this._image360Descriptor.timestamp) : undefined;
  }

  get annotations(): ImageAnnotationObject[] {
    return this._annotations ?? [];
  }

  intersectAnnotations(raycaster: THREE.Raycaster): ImageAnnotationObject | undefined {
    if (this._annotations === undefined) {
      return undefined;
    }

    for (const annotation of this._annotations) {
      const intersections = raycaster.intersectObject(annotation.getObject());
      if (intersections.length > 0) {
        return annotation;
      }
    }

    return undefined;
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
    annotationsCompleted: Promise<void>;
  } {
    const lowResolutionCompleted = this.loadPreviewTextures(abortSignal);
    const fullResolutionCompleted = this.loadFullTextures(abortSignal);

    this._onFullResolutionCompleted = fullResolutionCompleted;

    const annotationsCompleted = this.loadAnnotations();

    return { lowResolutionCompleted, fullResolutionCompleted, annotationsCompleted: awaitAnnotationCompleted() };

    async function awaitAnnotationCompleted(): Promise<void> {
      await annotationsCompleted;
    }
  }

  private async loadPreviewTextures(abortSignal?: AbortSignal): Promise<void> {
    const previewImageFiles = await this._imageProvider.getLowResolution360ImageFiles(
      this._image360Descriptor.faceDescriptors,
      abortSignal
    );
    const previewTextures = await this._image360VisualzationBox.loadFaceTextures(previewImageFiles);
    if (this._textures.length === 6) {
      previewTextures.forEach(texture => texture.texture.dispose());
      return;
    }
    this._textures = previewTextures;
  }

  private async loadFullTextures(abortSignal?: AbortSignal): Promise<void> {
    const fullImageFiles = await this._imageProvider.get360ImageFiles(
      this._image360Descriptor.faceDescriptors,
      abortSignal
    );

    const textures = await this._image360VisualzationBox.loadFaceTextures(fullImageFiles);
    if (this._textures.length > 0) {
      this._textures.forEach(texture => texture.texture.dispose());
    }
    this._textures = textures;
  }

  private async loadAnnotations(): Promise<ImageAnnotationObject[]> {
    if (this._annotations !== undefined) {
      return this._annotations;
    }

    const annotationData = await this._imageProvider.get360ImageAnnotations(this._image360Descriptor.faceDescriptors);

    const annotationObjects = annotationData
      .map(data => {
        const faceDescriptor = getAssociatedFaceDescriptor(data, this._image360Descriptor);
        return ImageAnnotationObject.createAnnotationObject(data, faceDescriptor.face);
      })
      .filter(isDefined);

    this._image360VisualzationBox.setAnnotations(annotationObjects);
    this._annotations = annotationObjects;

    return annotationObjects;
  }

  /**
   * Clear the cached textures used by this revision.
   */
  public dispose(): void {
    this._textures.forEach(t => t.texture.dispose());
    this._textures = [];
  }

  /**
   * Apply cached textures to the image360VisualzationBox.
   */
  public applyTextures(): void {
    this._image360VisualzationBox.loadImages(this._textures);
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
      this._image360VisualzationBox.loadImages(this._textures);
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
