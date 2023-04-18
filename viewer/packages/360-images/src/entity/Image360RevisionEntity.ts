/*!
 * Copyright 2022 Cognite AS
 */

import { Image360Descriptor, Image360Face, Image360FileProvider, Image360Texture } from '@reveal/data-providers';
import { Image360Revision } from './Image360Revision';
import { Image360VisualizationBox } from './Image360VisualizationBox';

export class Image360RevisionEntity implements Image360Revision {
  private readonly _imageProvider: Image360FileProvider;
  private readonly _image360Descriptor: Image360Descriptor;
  private readonly _image360VisualzationBox: Image360VisualizationBox;
  private _lowResolutionTexture: Image360Texture[];
  private _fullResolutionFaces: Image360Face[];
  private _getFullResolutionFaces: Promise<void> | undefined;
  private _textureQuality: 'unloaded' | 'low' | 'full';

  constructor(
    imageProvider: Image360FileProvider,
    image360Descriptor: Image360Descriptor,
    image360VisualzationBox: Image360VisualizationBox
  ) {
    this._imageProvider = imageProvider;
    this._image360Descriptor = image360Descriptor;
    this._image360VisualzationBox = image360VisualzationBox;
    this._lowResolutionTexture = [];
    this._fullResolutionFaces = [];
    this._getFullResolutionFaces = undefined;
    this._textureQuality = 'unloaded';
  }

  /**
   * The date of this revision. Undefined if the revison is undated.
   * @returns Date | undefined
   */
  get date(): Date | undefined {
    return this._image360Descriptor.timestamp ? new Date(this._image360Descriptor.timestamp) : undefined;
  }

  /**
   * Loads the textures needed for the 360 image (6 faces).
   *
   * This will start the download of both low and full resolution textures and return one promise for when the first image set is ready
   * and one promise for when both downloads are completed. If the low resolution images are completed first the full resolution
   * download and texture loading will continue in the background, and applyFullResolution can be used to apply full resolution textures
   * to the image360VisualzationBox at a desired time.
   *
   * @returns A promise for when the first set of textures has been loaded.
   */
  public loadTextures(abortSignal?: AbortSignal): Promise<void> {
    const lowResolutionFaces = this._imageProvider
      .getLowResolution360ImageFiles(this._image360Descriptor.faceDescriptors, abortSignal)
      .then(async faces => {
        return { faces, isLowResolution: true };
      });

    const fullResolutionFaces = this._imageProvider
      .get360ImageFiles(this._image360Descriptor.faceDescriptors, abortSignal)
      .then(async faces => {
        this._fullResolutionFaces = faces;
        return { faces, isLowResolution: false };
      });

    const startTime = performance.now();
    const firstCompleted = Promise.any([lowResolutionFaces, fullResolutionFaces]).then(
      async ({ faces, isLowResolution }) => {
        this._lowResolutionTexture = await this._image360VisualzationBox.loadFaceTextures(faces, !isLowResolution);
        this._getFullResolutionFaces = isLowResolution ? awaitFullResolution() : undefined;
        const endTime = performance.now();
        const resolution = isLowResolution ? 'LOW' : 'FULL';
        console.warn('Image loaded: ' + (endTime - startTime).toFixed(4) + ' Resolution: ' + resolution);
      }
    );

    return firstCompleted;

    async function awaitFullResolution(): Promise<void> {
      await fullResolutionFaces;
    }
  }

  /**
   * Clear the cached textures used by this revision.
   */
  public dispose(): void {
    this._lowResolutionTexture.forEach(t => t.texture.dispose());
    this._lowResolutionTexture = [];
    this._fullResolutionFaces = [];
    this._getFullResolutionFaces = undefined;
    this._textureQuality = 'unloaded';
  }

  /**
   * Apply full resolution textures to the image360VisualzationBox.
   */
  public async applyFullResolutionTextures(): Promise<void> {
    if (this._getFullResolutionFaces) {
      await this._getFullResolutionFaces.catch(() => {});
      this._getFullResolutionFaces = undefined;
    }

    if (this._fullResolutionFaces.length !== 6) return;

    if (this._textureQuality !== 'full') {
      this._textureQuality = 'full';
      const textures = await this._image360VisualzationBox.loadFaceTextures(this._fullResolutionFaces, false);
      this._image360VisualzationBox.loadImages(textures);
    }
  }

  /**
   * Apply low resolution textures to the image360VisualzationBox.
   */
  public applyLowResolutionTextures(): void {
    if (this._lowResolutionTexture.length !== 6) return;

    if (this._textureQuality !== 'low') {
      this._textureQuality = 'low';
      this._image360VisualzationBox.loadImages(this._lowResolutionTexture);
    }
  }

  /**
   * Apply low resolution textures to the image360VisualzationBox.
   */
  public unloadTexture(): void {
    if (this._lowResolutionTexture.length !== 6) return;

    if (this._textureQuality !== 'low') {
      this._textureQuality = 'low';
      this._image360VisualzationBox.loadImages(this._lowResolutionTexture);
    }
  }
}
