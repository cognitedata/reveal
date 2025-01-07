/*!
 * Copyright 2022 Cognite AS
 */

import {
  Image360FileDescriptor,
  Image360Descriptor,
  Image360Texture,
  DataSourceType,
  Image360Provider
} from '@reveal/data-providers';
import { Image360Revision } from './Image360Revision';
import { Image360VisualizationBox } from './Image360VisualizationBox';

import { ImageAnnotationObject } from '../annotation/ImageAnnotationObject';
import assert from 'assert';
import { Box3, Vector3, type Raycaster } from 'three';
import minBy from 'lodash/minBy';
import { Image360AnnotationAppearance } from '../annotation/types';
import { Image360AnnotationFilter } from '../annotation/Image360AnnotationFilter';
import { isCoreDmImage360Annotation } from '../annotation/typeGuards';
import { Image360RevisionId } from '@reveal/data-providers/src/types';

export class Image360RevisionEntity<T extends DataSourceType> implements Image360Revision<T> {
  private readonly _imageProvider: Image360Provider<T>;
  private readonly _image360Descriptor: Image360Descriptor<T>;
  private readonly _image360VisualizationBox: Image360VisualizationBox;
  private _previewTextures: Image360Texture[];
  private _fullResolutionTextures: Image360Texture[];
  private _onFullResolutionCompleted: Promise<void> | undefined;
  private _defaultAppearance: Image360AnnotationAppearance = {};

  private _identifier: Image360RevisionId<T>;

  private _annotations: ImageAnnotationObject<T>[] | undefined = undefined;
  private _annotationsPromise: Promise<ImageAnnotationObject<T>[]> | undefined;
  private readonly _annotationFilterer: Image360AnnotationFilter;

  constructor(
    identifier: Image360RevisionId<T>,
    imageProvider: Image360Provider<T>,
    image360Descriptor: Image360Descriptor<T>,
    image360VisualizationBox: Image360VisualizationBox,
    annotationFilterer: Image360AnnotationFilter
  ) {
    this._identifier = identifier;
    this._imageProvider = imageProvider;
    this._image360Descriptor = image360Descriptor;
    this._image360VisualizationBox = image360VisualizationBox;
    this._previewTextures = [];
    this._fullResolutionTextures = [];
    this._annotationFilterer = annotationFilterer;
  }

  /**
   * The identifier of this image 360 revision
   */
  get identifier(): Image360RevisionId<T> {
    return this._identifier;
  }

  /**
   * The date of this revision. Undefined if the revision is undated.
   * @returns Date | undefined
   */
  get date(): Date | undefined {
    return this._image360Descriptor.timestamp ? new Date(this._image360Descriptor.timestamp) : undefined;
  }

  async getAnnotations(): Promise<ImageAnnotationObject<T>[]> {
    if (this._annotations !== undefined) {
      return this._annotations;
    }

    if (this._annotationsPromise !== undefined) {
      return this._annotationsPromise;
    }

    this._annotationsPromise = this.loadAndSetAnnotations();

    return this._annotationsPromise;
  }

  public intersectAnnotations(raycaster: Raycaster): ImageAnnotationObject<T> | undefined {
    if (this._annotations === undefined) {
      return undefined;
    }

    const intersectedAnnotations = this._annotations.filter(a => a.getVisible() && a.intersects(raycaster));

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
   * and applyFullResolutionTextures can be called to apply full resolution textures to the image360VisualizationBox at a desired time.
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

  public async getPreviewThumbnailUrl(
    face?: 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom'
  ): Promise<string | undefined> {
    const selectedFace = face ?? 'front';
    const faceDescriptor = this._image360Descriptor.faceDescriptors.find(desc => desc.face === selectedFace);
    if (faceDescriptor === undefined) {
      return undefined;
    }
    const previewImageFiles = await this._imageProvider.getLowResolution360ImageFiles([faceDescriptor]);
    if (previewImageFiles.length !== 1) {
      return undefined;
    }
    const previewImageFile = previewImageFiles[0];
    const blob = new Blob([previewImageFile.data], { type: previewImageFile.mimeType });
    return window.URL.createObjectURL(blob);
  }

  private async loadPreviewTextures(abortSignal?: AbortSignal): Promise<void> {
    const previewImageFiles = await this._imageProvider.getLowResolution360ImageFiles(
      this._image360Descriptor.faceDescriptors,
      abortSignal
    );
    if (this._fullResolutionTextures.length === 6) {
      return;
    }
    const previewTextures = await this._image360VisualizationBox.loadFaceTextures(previewImageFiles);
    this._previewTextures = previewTextures;
  }

  private async loadFullTextures(abortSignal?: AbortSignal): Promise<void> {
    const fullImageFiles = await this._imageProvider.get360ImageFiles(
      this._image360Descriptor.faceDescriptors,
      abortSignal
    );

    const textures = await this._image360VisualizationBox.loadFaceTextures(fullImageFiles);
    this._fullResolutionTextures = textures;
  }

  private async loadAndSetAnnotations(): Promise<ImageAnnotationObject<T>[]> {
    const annotationData = await this._imageProvider.getRelevant360ImageAnnotations({
      revisionId: this._image360Descriptor.id,
      fileDescriptors: this._image360Descriptor.faceDescriptors
    });

    const filteredAnnotationData = annotationData.filter(a => this._annotationFilterer.filter(a));

    const annotationObjects = filteredAnnotationData
      .map(data => {
        const faceDescriptor = getAssociatedFaceDescriptor(data, this._image360Descriptor);
        return ImageAnnotationObject.createAnnotationObject(data, faceDescriptor?.face);
      })
      .filter(isDefined);

    this._image360VisualizationBox.setAnnotations(annotationObjects);
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
   * Apply cached textures to the image360VisualizationBox.
   */
  public applyTextures(): void {
    if (this._fullResolutionTextures.length === 6) {
      this._image360VisualizationBox.loadImages(this._fullResolutionTextures);
      return;
    }
    if (this._previewTextures.length === 6) {
      this._image360VisualizationBox.loadImages(this._previewTextures);
      return;
    }
  }

  /**
   * Apply full resolution textures to the image360VisualizationBox.
   * This has no effect if full resolution has already been applied.
   */
  public async applyFullResolutionTextures(): Promise<void> {
    if (!this._onFullResolutionCompleted) return;

    try {
      await this._onFullResolutionCompleted;
      this._onFullResolutionCompleted = undefined;
      this._image360VisualizationBox.loadImages(this._fullResolutionTextures);
      if (this._previewTextures.length === 6) {
        this._previewTextures.forEach(t => t.texture.dispose());
        this._previewTextures = [];
      }
    } catch (e) {}
  }

  public getDescriptors(): Image360Descriptor<T> {
    return this._image360Descriptor;
  }
}

function isDefined<T extends DataSourceType>(
  obj: ImageAnnotationObject<T> | undefined
): obj is ImageAnnotationObject<T> {
  return obj !== undefined && obj.getObject !== undefined;
}

function getAssociatedFaceDescriptor<T extends DataSourceType>(
  annotation: T['image360AnnotationType'],
  imageDescriptors: Image360Descriptor<T>
): Image360FileDescriptor | undefined {
  if (isCoreDmImage360Annotation(annotation)) {
    return undefined;
  }

  const fileDescriptors = imageDescriptors.faceDescriptors.filter(
    desc => desc.fileId === annotation.annotatedResourceId
  );

  assert(fileDescriptors.length !== 0);

  return fileDescriptors[0];
}
