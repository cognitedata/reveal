/*!
 * Copyright 2022 Cognite AS
 */

import { Image360Descriptor, Image360FileProvider, Image360Texture } from '@reveal/data-providers';
import { SceneHandler } from '@reveal/utilities';
import { Image360Revision } from './Image360Revision';
import { Image360VisualizationBox } from './Image360VisualizationBox';

export class Image360RevisionEntity implements Image360Revision {
  private readonly _imageProvider: Image360FileProvider;
  private readonly _image360Descriptor: Image360Descriptor;
  private readonly _transform: THREE.Matrix4;
  private readonly _image360VisualzationBox: Image360VisualizationBox;
  private readonly _revisionId: number;
  private _getFullResolutionTextures:
    | undefined
    | Promise<{ textures: Promise<Image360Texture[]>; isLowResolution: boolean }>;

  constructor(
    imageProvider: Image360FileProvider,
    image360Descriptor: Image360Descriptor,
    sceneHandler: SceneHandler,
    transform: THREE.Matrix4,
    revisionId: number
  ) {
    this._imageProvider = imageProvider;
    this._image360Descriptor = image360Descriptor;
    this._transform = transform;
    this._image360VisualzationBox = new Image360VisualizationBox(this._transform, sceneHandler);
    this._image360VisualzationBox.visible = false;
    this._revisionId = revisionId;
  }

  /**
   * The index of this revision.
   */
  get revisionId(): Readonly<number> {
    return this._revisionId;
  }

  /**
   * Get a copy of the model-to-world transformation matrix
   * of the given 360 image.
   * @returns model-to-world transform of the 360 Image
   */
  get transform(): THREE.Matrix4 {
    return this._transform.clone();
  }

  /**
   * The object containing the unit cube with the 360 images.
   * @returns Image360Visualization
   */
  get image360Visualization(): Image360VisualizationBox {
    return this._image360VisualzationBox;
  }

  /**
   * The date of this revision. Undefined if the revison is undated.
   * @returns Date | undefined
   */
  get date(): Date | undefined {
    return this._image360Descriptor.timestamp ? new Date(this._image360Descriptor.timestamp) : undefined;
  }

  /**
   * Loads the 360 image (6 faces) into the visualization object.
   *
   * This will start the download of both low and full resolution images and return one promise for when the first image set is ready
   * and one promise for when both downloads are completed. If the low resolution images are completed first the full resolution
   * download and texture loading will continue in the background, and applyFullResolution can be used to apply full resolution textures
   * to the image360VisualzationBox at a desired time.
   *
   * @returns firstCompleted A promise for when the first set om images has been loaded and applied to the image360VisualzationBox.
   * @returns fullResolutionCompleted A promise for when full resolution images are done loading.
   */
  public load360Image(abortSignal?: AbortSignal): {
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
        await this._image360VisualzationBox.loadImages(await textures);

        if (isLowResolution) {
          this._getFullResolutionTextures = fullResolutionFaces;
        }
      }
    );

    const fullResolutionCompleted = fullResolutionFaces
      .catch(e => {
        return Promise.reject(e);
      })
      .then(
        () => {
          return Promise.resolve();
        },
        reason => {
          return Promise.reject(reason);
        }
      );

    return { firstCompleted, fullResolutionCompleted };
  }

  /**
   * Apply full resolution textures to the image360VisualzationBox. This has no effect if full resolution has already been applied.
   */
  public async applyFullResolution(): Promise<void> {
    if (this._getFullResolutionTextures) {
      const result = await this._getFullResolutionTextures.catch(() => {});
      if (result) {
        this._image360VisualzationBox.loadImages(await result.textures);
        this._getFullResolutionTextures = undefined;
      }
    }
  }

  /**
   * Drops the GPU resources for the 360 image
   */
  public unload360Image(): void {
    this._getFullResolutionTextures = undefined;
    this._image360VisualzationBox.unloadImages();
  }
}
