/*!
 * Copyright 2021 Cognite AS
 */
import {
  AnnotationModel,
  AnnotationsCogniteAnnotationTypesImagesAssetLink,
  CogniteInternalId,
  IdEither
} from '@cognite/sdk';
import * as THREE from 'three';

export type Image360AnnotationFilterDelegate = (annotation: AnnotationModel) => boolean;

export interface JsonFileProvider {
  getJsonFile(baseUrl: string, fileName: string): Promise<any>;
}

export interface BinaryFileProvider {
  getBinaryFile(baseUrl: string, fileName: string, abortSignal?: AbortSignal): Promise<ArrayBuffer>;
}

export interface Image360AnnotationProvider {
  get360ImageAnnotations(descriptors: Image360FileDescriptor[]): Promise<AnnotationModel[]>;
  getFilesByAssetRef(assetId: IdEither): Promise<CogniteInternalId[]>;
}

export interface Image360DescriptorProvider<T> {
  get360ImageDescriptors(metadataFilter: T, preMultipliedRotation: boolean): Promise<Historical360ImageSet[]>;
}

export interface Image360FileProvider {
  get360ImageFiles(
    image360FaceDescriptors: Image360FileDescriptor[],
    abortSignal?: AbortSignal
  ): Promise<Image360Face[]>;

  getLowResolution360ImageFiles(
    image360FaceDescriptors: Image360FileDescriptor[],
    abortSignal?: AbortSignal
  ): Promise<Image360Face[]>;
}

/**
 * A CDF AnnotationModel with a narrower type representing an image asset link
 */
export type ImageAssetLinkAnnotation = Omit<AnnotationModel, 'data'> & {
  /**
   * The data associated with the image asset link
   */
  data: AnnotationsCogniteAnnotationTypesImagesAssetLink;
};

export interface Image360AssetProvider {
  get360ImageAssets(
    image360FileDescriptors: Image360FileDescriptor[],
    annotationFilter: Image360AnnotationFilterDelegate
  ): Promise<ImageAssetLinkAnnotation[]>;
}

export type Historical360ImageSet = Image360EventDescriptor & {
  imageRevisions: Image360Descriptor[];
};

export type Image360Descriptor = {
  timestamp?: number;
  faceDescriptors: Image360FileDescriptor[];
};

export type Image360EventDescriptor = {
  id: string;
  label: string | undefined;
  collectionId: string;
  collectionLabel: string | undefined;
  transform: THREE.Matrix4;
};

export type Image360Face = {
  face: 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
  mimeType: 'image/jpeg' | 'image/png';
  data: ArrayBuffer;
};

export type Image360Texture = {
  face: 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
  texture: THREE.Texture;
};

export type Image360FileDescriptor = {
  fileId: number;
  face: 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
  mimeType: 'image/jpeg' | 'image/png';
};

export enum File3dFormat {
  EptPointCloud = 'ept-pointcloud',
  /**
   * Reveal v9 and above (GLTF based output)
   */
  GltfCadModel = 'gltf-directory',
  AnyFormat = 'all-outputs'
}

export interface BlobOutputMetadata {
  blobId: number;
  format: File3dFormat | string;
  version: number;
}
