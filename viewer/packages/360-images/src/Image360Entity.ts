/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { SceneHandler } from '@reveal/utilities';
import { Image360Descriptor, Image360FileProvider } from '@reveal/data-providers';
import { Image360Icon } from './Image360Icon';
import { Image360VisualizationBox } from './Image360VisualizationBox';
import { Image360Visualization } from './Image360Visualization';

export class Image360Entity {
  private readonly _imageProvider: Image360FileProvider;
  private readonly _image360Metadata: Image360Descriptor;
  private readonly _transform: THREE.Matrix4;
  private readonly _image360Icon: Image360Icon;
  private readonly _image360VisualzationBox: Image360VisualizationBox;

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
  get image360Visualization(): Image360Visualization {
    return this._image360VisualzationBox;
  }

  constructor(
    image360Metadata: Image360Descriptor,
    sceneHandler: SceneHandler,
    imageProvider: Image360FileProvider,
    postTransform: THREE.Matrix4,
    preComputedRotation: boolean
  ) {
    this._imageProvider = imageProvider;
    this._image360Metadata = image360Metadata;

    this._transform = this.computeTransform(image360Metadata, preComputedRotation, postTransform);
    this._image360Icon = new Image360Icon(this._transform, sceneHandler);
    this._image360VisualzationBox = new Image360VisualizationBox(this._transform, sceneHandler);
  }

  /**
   * Loads the 360 image (6 faces) into the visualization object.
   */
  public async load360Image(): Promise<void> {
    await this._imageProvider
      .get360ImageFiles(this._image360Metadata)
      .then(faces => this._image360VisualzationBox.loadImages(faces));
    this._image360VisualzationBox.visible = false;
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

  private computeTransform(
    image360Metadata: Image360Descriptor,
    preComputedRotation: boolean,
    postTransform: THREE.Matrix4
  ): THREE.Matrix4 {
    const { translation, rotation } = image360Metadata.transformations;

    const entityTransform = translation.clone();

    if (!preComputedRotation) {
      entityTransform.multiply(rotation.clone().multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2)));
    } else {
      entityTransform.multiply(new THREE.Matrix4().makeRotationY(Math.PI));
    }

    return postTransform.clone().multiply(entityTransform);
  }
}
