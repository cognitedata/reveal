/*!
 * Copyright 2022 Cognite AS
 */

import { Image360Descriptor, Image360FileProvider, Image360Texture } from '@reveal/data-providers';
import { Image360Revision } from './Image360Revision';
import { Image360VisualizationBox } from './Image360VisualizationBox';

export class Image360RevisionEntity implements Image360Revision {
  private readonly _imageProvider: Image360FileProvider;
  private readonly _image360Descriptor: Image360Descriptor;
  private readonly _image360VisualzationBox: Image360VisualizationBox;
  private _textures: Image360Texture[];
  private _getFullResolutionTextures:
    | Promise<{ textures: Promise<Image360Texture[]>; isLowResolution: boolean }>
    | undefined;

  constructor(
    imageProvider: Image360FileProvider,
    image360Descriptor: Image360Descriptor,
    image360VisualzationBox: Image360VisualizationBox
  ) {
    this._imageProvider = imageProvider;
    this._image360Descriptor = image360Descriptor;
    this._image360VisualzationBox = image360VisualzationBox;
    this._textures = [];
    this._getFullResolutionTextures = undefined;
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
   * This will start the download of both low and full resolution textures and return a promise for when the first image set is ready.
   * If the low resolution images are completed first the full resolution download and texture loading will continue in the background,
   * and applyFullResolution can be used to apply full resolution textures to the image360VisualzationBox at a desired time.
   *
   * @returns A promise for when the first set of textures has been loaded.
   */
  public loadTextures(abortSignal?: AbortSignal): Promise<void> {
    const lowResolutionFaces = this._imageProvider
      .getLowResolution360ImageFiles(this._image360Descriptor.faceDescriptors, abortSignal)
      .then(async faces => {
        return { textures: this._image360VisualzationBox.loadFaceTextures(faces), isLowResolution: true };
      });

    const fullResolutionFaces = this._imageProvider
      .get360ImageFiles(this._image360Descriptor.faceDescriptors, abortSignal)
      .then(async faces => {
        return { textures: this._image360VisualzationBox.loadFaceTextures(faces), isLowResolution: false };
      });

    const firstCompleted = Promise.any([lowResolutionFaces, fullResolutionFaces]).then(
      async ({ textures, isLowResolution }) => {
        this._textures = await textures;
        this._getFullResolutionTextures = isLowResolution ? fullResolutionFaces : undefined;
      }
    );

    return firstCompleted;
  }

  /**
   * Clear the cached textures used by this revision.
   */
  public dispose(): void {
    this._textures.forEach(t => t.texture.dispose());
    this._textures = [];
    this._getFullResolutionTextures = undefined;
  }

  /**
   * Apply cached textures to the image360VisualzationBox.
   */
  public applyTextures(id: string): void {
    this._image360VisualzationBox.loadImages(this._textures);
  }

  /**
   * Apply full resolution textures to the image360VisualzationBox. This has no effect if full resolution has already been applied.
   */
  public async applyFullResolutionTextures(id: string): Promise<void> {
    if (!this._getFullResolutionTextures) return;

    try {
      const result = await this._getFullResolutionTextures;
      this._textures = await result.textures;
      this._image360VisualzationBox.loadImages(this._textures);
      this._getFullResolutionTextures = undefined;
    } catch (e) {}
  }
}
