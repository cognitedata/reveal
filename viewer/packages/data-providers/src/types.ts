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
export type ImageAssetLinkAnnotationInfo = Omit<AnnotationModel, 'data'> & {
  /**
   * The data associated with the image asset link
   */
  data: AnnotationsCogniteAnnotationTypesImagesAssetLink;
};

export interface Image360AssetProvider {
  get360ImageAssets(
    image360FileDescriptors: Image360FileDescriptor[],
    annotationFilter: Image360AnnotationFilterDelegate
  ): Promise<ImageAssetLinkAnnotationInfo[]>;
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

type InstanceType = 'node' | 'edge';

export type Item = {
  instanceType: InstanceType;
} & InstanceIdentifier;

export type Source = {
  type: 'view';
  version: string;
} & InstanceIdentifier;

export type InstanceIdentifier = {
  space: string;
  externalId: string;
};

export type EdgeItem = {
  startNode: InstanceIdentifier;
  endNode: InstanceIdentifier;
};

export type Query = {
  with: Record<string, ResultSetExpression>;
  select: Record<string, QuerySelect>;
  parameters?: Record<string, string | number>;
  cursors?: Record<string, string>;
};

type QuerySelect = {
  sources: readonly SourceProperties[];
};

type SourceProperties = {
  source: TestSource;
  properties: readonly string[];
};

type TestSource = {
  type: 'view';
  space: string;
  externalId: string;
  version: string;
};

export type ResultSetExpression = (NodeResultSetExpression | EdgeResultSetExpression) & {
  limit?: number;
  sort?: any[];
};

export type NodeResultSetExpression = {
  nodes: {
    filter?: any;
    from?: any;
    through?: any;
    chainTo?: any;
  };
};

export type EdgeResultSetExpression = {
  edges: {
    filter?: any;
    from?: any;
    nodeFilter?: any;
    maxDistance?: number;
    direction?: 'outwards' | 'inwards';
    limitEach?: number;
  };
};

type SelectKey<T extends Query> = keyof T['select'];
type Sources<T extends Query, K extends SelectKey<T>> = T['select'][K]['sources'][0];
type MainSource<T extends Query, K extends SelectKey<T>> = Sources<T, K>['source'];
type MainSourceProperties<T extends Query, K extends SelectKey<T>> = Sources<T, K>['properties'];

type ResultExpressionProperties<T extends Query, K extends SelectKey<T>> = {
  [V in MainSource<T, K>['space']]: {
    [Q in `${MainSource<T, K>['externalId']}/${MainSource<T, K>['version']}`]: {
      [B in MainSourceProperties<T, K>[number]]: string | number | InstanceIdentifier;
    };
  };
};

type ResultExpression<T extends Query, K extends SelectKey<T>> = {
  instanceType: 'node';
  version: number;
  space: string;
  externalId: string;
  createdTime: number;
  lastUpdatedTime: number;
  properties: ResultExpressionProperties<T, K>;
};

export type QueryNextCursors<T extends Query> = { [K in SelectKey<T>]?: string | undefined };

export type QueryResult<T extends Query> = {
  [K in SelectKey<T>]: ResultExpression<T, K>[];
} & { nextCursor?: QueryNextCursors<T> };
