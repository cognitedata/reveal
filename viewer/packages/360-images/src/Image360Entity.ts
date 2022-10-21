/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import assert from 'assert';
import { SceneHandler } from '@reveal/utilities';
import { Image360Descriptor, Image360FileProvider, Image360Face } from '@reveal/data-providers';
import { Image360Icon } from './Image360Icon';

export class Image360Entity {
  private readonly _imageProvider: Image360FileProvider;
  private readonly _image360Metadata: Image360Descriptor;
  private readonly _sceneHandler: SceneHandler;
  private readonly _transform: THREE.Matrix4;
  private readonly _image360Icon: Image360Icon;
  private _faceMaterials: THREE.MeshBasicMaterial[] | undefined;
  private _imageContainer: THREE.Mesh | undefined;

  /**
   * Get the model-to-world transformation matrix
   * of the given 360 image.
   * @returns model-to-world transform of the 360 Image
   */
  get transform(): THREE.Matrix4 {
    return this._transform;
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
    this._faceMaterials?.forEach(material => {
      material.opacity = alpha;
    });
  }

  constructor(
    image360Metadata: Image360Descriptor,
    sceneHandler: SceneHandler,
    imageProvider: Image360FileProvider,
    postTransform: THREE.Matrix4,
    preComputedRotation: boolean
  ) {
    this._sceneHandler = sceneHandler;
    this._imageProvider = imageProvider;
    this._image360Metadata = image360Metadata;

    this._transform = this.computeTransform(image360Metadata, preComputedRotation, postTransform);
    this._image360Icon = new Image360Icon(this._transform);

    sceneHandler.addCustomObject(this._image360Icon);
  }

  /**
   * Enables a unit inverted cube which contains the 360 image.
   */
  public async activate360Image(): Promise<void> {
    this._imageContainer = this._imageContainer ?? (await this.load360Image());
    this._imageContainer.visible = true;
  }

  /**
   * Disables the unit inverted cube which contains the 360 image.
   */
  public async deactivate360Image(): Promise<void> {
    if (this._imageContainer === undefined) {
      return;
    }
    this._imageContainer.visible = false;
  }

  private async load360Image(): Promise<THREE.Mesh> {
    const faces = await this._imageProvider.get360ImageFiles(this._image360Metadata);
    const box = await this.createImage360VisualizationObject(faces);
    box.applyMatrix4(this._transform);
    this._sceneHandler.addCustomObject(box);
    return box;
  }

  private async createImage360VisualizationObject(faces: Image360Face[]): Promise<THREE.Mesh> {
    const loader = new THREE.TextureLoader();
    const faceTextures = await getTextures();

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

    const faceMaterialOrder: Image360Face['face'][] = ['left', 'right', 'top', 'bottom', 'front', 'back'];

    this._faceMaterials = faceMaterialOrder.map(
      face =>
        new THREE.MeshBasicMaterial({
          side: THREE.BackSide,
          map: getFaceTexture(face),
          depthTest: false,
          opacity: 1.0,
          transparent: true
        })
    );
    const mesh = new THREE.Mesh(boxGeometry, this._faceMaterials);
    mesh.renderOrder = 3;
    return mesh;

    function getTextures() {
      return Promise.all(
        faces.map(async image360Face => {
          const blob = new Blob([image360Face.data]);
          const url = window.URL.createObjectURL(blob);
          const faceTexture = await loader.loadAsync(url);
          faceTexture.wrapS = THREE.RepeatWrapping;
          // Need to horizontally flip the texture since it is being rendered inside a cube
          faceTexture.repeat.x = -1;
          return { side: image360Face.face, faceTexture };
        })
      );
    }
    function getFaceTexture(side: Image360Face['face']) {
      const face = faceTextures.find(p => p.side === side);
      assert(face !== undefined);
      return face.faceTexture;
    }
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
