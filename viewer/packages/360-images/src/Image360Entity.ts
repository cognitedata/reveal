/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { SceneHandler } from '@reveal/utilities';
import { Image360Descriptor, Image360FileProvider } from '@reveal/data-providers';
import { Image360Icon } from './Image360Icon';
import { Image360VisualizationBox } from './Image360VisualizationBox';

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
   * Sets the opacity of this 360 image.
   */
  set opacity(alpha: number) {
    this._image360VisualzationBox.opacity = alpha;
  }

  set scale(newScale: THREE.Vector3) {
    this._image360VisualzationBox.scale = newScale;
  }

  set renderOrder(newRenderOrder: number) {
    this._image360VisualzationBox.renderOrder = newRenderOrder;
  }

  set visible(isVisible: boolean) {
    this._image360VisualzationBox.visible = isVisible;
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
    this._image360Icon = new Image360Icon(this._transform);
    this._image360VisualzationBox = new Image360VisualizationBox(this._transform, sceneHandler);

    sceneHandler.addCustomObject(this._image360Icon);
  }

  public async load360Image(): Promise<void> {
    await this._imageProvider
      .get360ImageFiles(this._image360Metadata)
      .then(faces => this._image360VisualzationBox.loadImages(faces));
    this._image360VisualzationBox.visible = false;
  }

  public unload360Image(): void {
    this._image360VisualzationBox.unloadImages();
  }

  public dispose(): void {
    this.unload360Image();
    //TODO: dispose icon
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
