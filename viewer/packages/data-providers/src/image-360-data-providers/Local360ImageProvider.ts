/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import { Image360Provider } from '../Image360Provider';
import { Image360Descriptor, Image360Face } from '../types';

type Local360ImagesDescriptor = {
  imageFolder: string;
  translation: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
};

export class Local360ImageProvider implements Image360Provider<unknown> {
  private readonly _modelUrl: string;
  constructor(modelUrl: string) {
    this._modelUrl = modelUrl;
  }
  public async get360ImageDescriptors(): Promise<Image360Descriptor[]> {
    const image360File = '360Images.json';
    const response = await fetch(`${this._modelUrl}/${image360File}`).catch(_err => {
      throw Error('Could not download Json file');
    });
    const local360ImagesDescriptor: Local360ImagesDescriptor[] = await response.json();

    return local360ImagesDescriptor.map(localDescriptor => {
      const translation = new THREE.Matrix4().makeTranslation(
        localDescriptor.translation.x,
        localDescriptor.translation.y,
        localDescriptor.translation.z
      );
      const rotation = new THREE.Matrix4().makeRotationFromEuler(
        new THREE.Euler(localDescriptor.rotation.x, localDescriptor.rotation.y, localDescriptor.rotation.z)
      );
      return {
        id: localDescriptor.imageFolder,
        label: localDescriptor.imageFolder,
        collectionId: 'local',
        collectionLabel: 'local',
        transformations: {
          translation,
          rotation
        }
      } as Image360Descriptor;
    });
  }
  get360ImageFiles(image360Descriptor: Image360Descriptor): Promise<Image360Face[]> {
    const imageFacesName = ['left', 'right', 'top', 'bottom', 'front', 'back'];

    return Promise.all(
      imageFacesName.map(async name => {
        const binaryData = await (await fetch(`${this._modelUrl}/${image360Descriptor.id}/${name}.png`)).arrayBuffer();
        return {
          data: binaryData,
          face: name,
          mimeType: 'image/png'
        } as Image360Face;
      })
    );
  }
}
