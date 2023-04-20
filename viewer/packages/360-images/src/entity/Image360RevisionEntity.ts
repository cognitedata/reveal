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

import { ImageAnnotationObject, isAnnotationsObject } from '../annotation/ImageAnnotationObject';
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
    for (const annotation of this.annotations) {
      const intersections = raycaster.intersectObject(annotation.getObject());
      if (intersections.length > 0) {
        return annotation;
      }
    }

    return undefined;
  }

  private createQuadFromAnnotation(
    annotation: AnnotationModel,
    descriptor: Image360FileDescriptor
  ): ImageAnnotationObject | undefined {
    const annotationData = annotation.data;

    // TODO Make this check prettier
    if (!isAnnotationsObject(annotationData) || annotationData.boundingBox === undefined) {
      return undefined;
    }

    return new ImageAnnotationObject(annotation, descriptor);
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
    const lowResolutionCompleted = this._imageProvider
      .getLowResolution360ImageFiles(this._image360Descriptor.faceDescriptors, abortSignal)
      .then(async faces => {
        const textures = await this._image360VisualzationBox.loadFaceTextures(faces);

        //If textures are already set we do not override these with low resolution.
        if (this._textures.length === 6) return;
        this._textures = textures;
      });

    const fullResolutionCompleted = this._imageProvider
      .get360ImageFiles(this._image360Descriptor.faceDescriptors, abortSignal)
      .then(async faces => {
        const textures = await this._image360VisualzationBox.loadFaceTextures(faces);
        this._textures = textures;
      });

    this._onFullResolutionCompleted = fullResolutionCompleted;
    this.loadAnnotations();

    return { lowResolutionCompleted, fullResolutionCompleted };
  }

  private async loadAnnotations(): Promise<void> {
    if (this._annotations !== undefined) {
      return;
    }

    const annotationData = await this._imageProvider.get360ImageAnnotations(this._image360Descriptor.faceDescriptors);

    const annotationObjects = annotationData
      .map(data => {
        const faceDescriptor = getAssociatedFaceDescriptor(data, this._image360Descriptor);
        return this.createQuadFromAnnotation(data, faceDescriptor);
      })
      .filter(isDefined);

    this._annotations = annotationObjects;
    this._image360VisualzationBox.setAnnotations(annotationObjects);
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
