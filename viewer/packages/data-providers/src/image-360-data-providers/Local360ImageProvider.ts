/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import { Image360Provider } from '../Image360Provider';
import { Image360Descriptor, Image360Face, Image360FileDescriptor } from '../types';

type Local360ImagesDescriptor = {
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
  faces: [
    {
      face: string;
      id: number;
    }
  ];
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

    return local360ImagesDescriptor.map((localDescriptor, index) => {
      const translation = new THREE.Matrix4().makeTranslation(
        localDescriptor.translation.x,
        localDescriptor.translation.y,
        localDescriptor.translation.z
      );
      const rotation = new THREE.Matrix4().makeRotationFromEuler(
        new THREE.Euler(localDescriptor.rotation.x, localDescriptor.rotation.y, localDescriptor.rotation.z)
      );

      const image360Descriptor: Image360Descriptor = {
        id: index.toString(),
        label: index.toString(),
        collectionId: 'local',
        collectionLabel: 'local',
        transformations: {
          translation,
          rotation
        },
        faceDescriptors: localDescriptor.faces.map(p => {
          return { face: p.face, fileId: p.id, mimeType: 'image/png' } as Image360FileDescriptor;
        })
      };

      return image360Descriptor;
    });
  }
  get360ImageFiles(image360FaceDescriptors: Image360FileDescriptor[], init?: RequestInit): Promise<Image360Face[]> {
    return Promise.all(
      image360FaceDescriptors.map(async image360FaceDescriptor => {
        const binaryData = await (
          await fetch(`${this._modelUrl}/${image360FaceDescriptor.fileId}.png`, { signal: init?.signal })
        ).arrayBuffer();
        return {
          data: binaryData,
          face: image360FaceDescriptor.face
        } as Image360Face;
      })
    );
  }
}
