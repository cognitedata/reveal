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
   * @returns firstCompleted A promise for when the first set of textures has been loaded.
   * @returns fullResolutionCompleted A promise for when full resolution images are done loading.
   */
  public loadTextures(abortSignal?: AbortSignal): {
    firstCompleted: Promise<void>;
    fullResolutionCompleted: Promise<void>;
  } {
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

        if (isLowResolution) {
          this._getFullResolutionTextures = fullResolutionFaces;
        }
      }
    );

    return { firstCompleted, fullResolutionCompleted: awaitFullResolution() };

    async function awaitFullResolution(): Promise<void> {
      await fullResolutionFaces;
    }
  }

  /**
   * Clear the cached textures used by this revision.
   */
  public clearTextures(): void {
    this._textures = [];
  }

  /**
   * Apply cached textures to the image360VisualzationBox.
   */
  public applyTextures(): void {
    this._image360VisualzationBox.createImage(this._textures);
  }

  /**
   * Apply full resolution textures to the image360VisualzationBox. This has no effect if full resolution has already been applied.
   */
  public async applyFullResolutionTextures(): Promise<void> {
    if (!this._getFullResolutionTextures) return undefined;

    try {
      const result = await this._getFullResolutionTextures;
      if (result) {
        this._textures = await result.textures;
        this._image360VisualzationBox.createImage(this._textures);
        this._getFullResolutionTextures = undefined;
      }
    } catch (e) {}
  }
}
