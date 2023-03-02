/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { SceneHandler } from '@reveal/utilities';
import { Image360Descriptor, Image360FileProvider } from '@reveal/data-providers';
import { Image360Icon } from '../icons/Image360Icon';
import { Image360VisualizationBox } from './Image360VisualizationBox';
import { Image360 } from './Image360';

export class Image360Entity implements Image360 {
  private readonly _imageProvider: Image360FileProvider;
  private readonly _image360Metadata: Image360Descriptor;
  private readonly _transform: THREE.Matrix4;
  private readonly _image360Icon: Image360Icon;
  private readonly _image360VisualzationBox: Image360VisualizationBox;
  private _requestRedraw: () => void;

  /**
   * Get a copy of the model-to-world transformation matrix
   * of the given 360 image.
   * @returns model-to-world transform of the 360 Image
   */
  get transform(): THREE.Matrix4 {
    return this._transform.clone();
  }

  /**
   * Get the icon that represents the 360
   * image during normal visualization.
   * @returns Image360Icon
   */
  get icon(): Image360Icon {
    return this._image360Icon;
  }

  /**
   * The object containing the unit cube with the 360 images.
   * @returns Image360Visualization
   */
  get image360Visualization(): Image360VisualizationBox {
    return this._image360VisualzationBox;
  }

  public setRequestRedraw(redrawRequestFunc: () => void): void {
    this._requestRedraw = redrawRequestFunc;
  }

  constructor(
    image360Metadata: Image360Descriptor,
    sceneHandler: SceneHandler,
    imageProvider: Image360FileProvider,
    transform: THREE.Matrix4,
    icon: Image360Icon
  ) {
    this._imageProvider = imageProvider;
    this._image360Metadata = image360Metadata;

    this._transform = transform;
    this._image360Icon = icon;
    this._image360VisualzationBox = new Image360VisualizationBox(this._transform, sceneHandler);
    this._image360VisualzationBox.visible = false;
    this._requestRedraw = () => {};
  }

  /**
   * Loads the 360 image (6 faces) into the visualization object.
   */
  public async load360Image(abortSignal?: AbortSignal): Promise<void> {
    const lowResolutionFaces = await this._imageProvider
      .getLowResolution360ImageFiles(this._image360Metadata.faceDescriptors)
      .catch(() => {
        return undefined;
      });

    const fullResolutionFaces = this._imageProvider.get360ImageFiles(
      this._image360Metadata.faceDescriptors,
      abortSignal
    );

    if (!lowResolutionFaces) {
      await this._image360VisualzationBox.loadImages(await fullResolutionFaces);
    } else {
      await this._image360VisualzationBox.loadImages(lowResolutionFaces);

      fullResolutionFaces.then(async faces => {
        await this._image360VisualzationBox.setFaceMaterials(faces);
        this._requestRedraw();
      });
    }
  }

  /**
   * Drops the GPU resources for the 360 image
   * the icon will be preserved.
   */
  public unload360Image(): void {
    this._image360VisualzationBox.unloadImages();
  }

  /**
   * @obvious
   */
  public dispose(): void {
    this.unload360Image();
    this._image360Icon.dispose();
  }
}
