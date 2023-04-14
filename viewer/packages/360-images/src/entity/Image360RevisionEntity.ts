/*!
 * Copyright 2022 Cognite AS
 */

import {
  Cdf360ImageEventProvider,
  Image360Descriptor,
  Image360FileProvider,
  Image360Texture
} from '@reveal/data-providers';
import { Image360Revision } from './Image360Revision';
import { Image360VisualizationBox } from './Image360VisualizationBox';
import { AnnotationModel, AnnotationsObjectDetection } from '@cognite/sdk';

import { PlaneGeometry, Mesh, MeshBasicMaterial, DoubleSide, Matrix4, Vector3 } from 'three';
import { Image360Face, Image360FileDescriptor } from '@reveal/data-providers/src/types';

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

  private getRotationFromFace(face: Image360Face['face']): Matrix4 {
    switch (face) {
      case 'front':
        return new Matrix4().identity();
      case 'back':
        return new Matrix4().makeRotationAxis(new Vector3(0, 1, 0), Math.PI);
      case 'left':
        return new Matrix4().makeRotationAxis(new Vector3(0, 1, 0), Math.PI / 2);
      case 'right':
        return new Matrix4().makeRotationAxis(new Vector3(0, 1, 0), -Math.PI / 2);
      case 'top':
        return new Matrix4().makeRotationAxis(new Vector3(1, 0, 0), -Math.PI / 2);
      case 'bottom':
        return new Matrix4().makeRotationAxis(new Vector3(1, 0, 0), Math.PI / 2);
      default:
        throw Error(`Unrecognized face identifier "${face}"`);
    }
  }

  private createQuadFromAnnotation([annotationData, descriptor]: [AnnotationModel, Image360FileDescriptor]):
    | THREE.Object3D
    | undefined {
    const abox = (annotationData.data as AnnotationsObjectDetection).boundingBox;

    if (abox === undefined) {
      return undefined;
    }

    const rotationMatrix = this.getRotationFromFace(descriptor.face);

    const initialTranslation = new Matrix4().makeTranslation(
      0.5 - (abox.xMax + abox.xMin) / 2,
      0.5 - (abox.yMax + abox.yMin) / 2,
      0.5
    );

    const geometry = new PlaneGeometry(abox.xMax - abox.xMin, abox.yMax - abox.yMin);
    const material = new MeshBasicMaterial({
      color: 0xffff00,
      side: DoubleSide,
      depthTest: false,
      opacity: 0.5,
      transparent: true
    });
    const plane = new Mesh(geometry, material);

    const transformation = initialTranslation.clone().premultiply(rotationMatrix); // .multiply(this._image360VisualzationBox);
    plane.matrix = transformation;
    plane.matrixAutoUpdate = false;
    plane.renderOrder = 4;
    return plane;
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

    const annotations = (this._imageProvider as Cdf360ImageEventProvider)
      .getFileAnnotations(this._image360Descriptor.faceDescriptors)
      .then(data =>
        data
          .map(d => combineWithFaceDescriptor(d, this._image360Descriptor))
          .map(d => this.createQuadFromAnnotation(d))
          .filter(isDefined)
      );

    const firstCompleted = Promise.any([lowResolutionFaces, fullResolutionFaces]).then(
      async ({ textures, isLowResolution }) => {
        this._textures = await textures;

        if (isLowResolution) {
          this._getFullResolutionTextures = fullResolutionFaces;
        }
      }
    );

    this._image360VisualzationBox.setAnnotations(annotations);

    return { firstCompleted, fullResolutionCompleted: awaitFullResolution() };

    async function awaitFullResolution(): Promise<void> {
      await fullResolutionFaces;
    }
  }

  /**
   * Clear the cached textures used by this revision.
   */
  public clearTextures(): void {
    this._textures.forEach(t => t.texture.dispose());
    this._textures = [];
  }

  /**
   * Apply cached textures to the image360VisualzationBox.
   */
  public applyTextures(): void {
    this._image360VisualzationBox.loadImages(this._textures);
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
        this._image360VisualzationBox.loadImages(this._textures);
        this._getFullResolutionTextures = undefined;
      }
    } catch (e) {}
  }
}

function isDefined(obj: THREE.Object3D | undefined): obj is THREE.Object3D {
  return obj !== undefined;
}

function combineWithFaceDescriptor(
  annotation: AnnotationModel,
  faceDescriptors: Image360Descriptor
): [AnnotationModel, Image360FileDescriptor] {
  return [
    annotation,
    faceDescriptors.faceDescriptors.filter(desc => desc.fileId === annotation.annotatedResourceId)[0]
  ];
}
