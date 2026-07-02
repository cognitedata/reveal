/*!
 * Copyright 2021 Cognite AS
 */
import type {
  AnnotationModel,
  AnnotationsTypesImagesAssetLink,
  AnnotationsTypesImagesInstanceLink,
  IdEither
} from '@cognite/sdk';
import type { Matrix4, Texture } from 'three';
import type { ClassicDataSourceType, DataSourceType, DMDataSourceType } from './DataSourceType';
import type {
  AssetAnnotationImage360Info,
  AssetHybridAnnotationImage360Info,
  DefaultImage360Collection,
  Image360AnnotationAssetQueryResult,
  Image360AnnotationInstanceReference
} from '@reveal/360-images';
import type { DMInstanceRef } from '@reveal/utilities';
import type { ModelIdentifier } from './ModelIdentifier';

export type Image360AnnotationFilterDelegate<T extends DataSourceType> = (
  annotation: T['image360AnnotationType']
) => boolean;

export interface JsonFileProvider {
  /**
   * Download and parse a JSON file and return the resulting struct.
   * @param baseUrl     Base URL of the model. Pass empty string to treat fileName as a full signed URL.
   * @param fileName    Filename of JSON file, or a full signed URL when baseUrl is empty.
   */
  getJsonFile(baseUrl: string, fileName: string): Promise<any>;
}

export interface BinaryFileProvider {
  /**
   * Downloads a binary blob.
   * @param baseUrl     Base URL of the model. Pass empty string to treat fileName as a full signed URL.
   * @param fileName    Filename of binary file, or a full signed URL when baseUrl is empty.
   * @param abortSignal Optional abort signal that can be used to cancel an in progress fetch.
   */
  getBinaryFile(baseUrl: string, fileName: string, abortSignal?: AbortSignal): Promise<ArrayBuffer>;
}
export interface SignedFileProvider {
  /**
   * Retrieves signed URLs for files belonging to a model revision.
   * @param baseUrl          Base URL of the signed files endpoint.
   * @param modelIdentifier  Identifier of the model revision to fetch URLs for.
   * @param fileNameFilter   Optional filename to filter results to a single file.
   */
  getFileUrlsForModel?(
    baseUrl: string,
    modelIdentifier: ModelIdentifier,
    fileNameFilter?: string
  ): Promise<SignedFileItem[]>;
}

export type SignedFileItem = {
  signedUrl: string;
  fileName: string;
  subPath: string;
};

export type SignedFilesResponseWithCursor = {
  items: SignedFileItem[];
  nextCursor?: string;
};

/**
 * An ID identifiying a single Image360 entity within a collection
 */
export type Image360Id<T extends DataSourceType> = Image360RevisionId<T>;
/**
 * An ID identifiying a single Image360 revision within a collection
 */
export type Image360RevisionId<T extends DataSourceType> = T extends DMDataSourceType ? DMInstanceRef : string;

export type Image360AnnotationSpecifier<T extends DataSourceType> = {
  revisionId: Image360RevisionId<T>;
  fileDescriptors: Image360FileDescriptor[];
};

/**
 * Filter for finding linked annotations in either a classic 360 collection or a new one
 */
export type InstanceReference<T extends DataSourceType> = T extends ClassicDataSourceType ? IdEither : DMInstanceRef;

export interface Image360AnnotationProvider<T extends DataSourceType> {
  getRelevant360ImageAnnotations(
    annotationSpecifier: Image360AnnotationSpecifier<T>
  ): Promise<T['image360AnnotationType'][]>;

  /**
   * Resolves the mapping from internal file IDs (annotatedResourceId) to external IDs.
   * This is needed to match annotations to face descriptors when descriptors use externalId.
   * Optional - if not implemented, the caller should build mapping from descriptors only.
   */
  resolveFileIdToExternalIdMapping?(
    annotations: T['image360AnnotationType'][],
    descriptors: Image360FileDescriptor[]
  ): Promise<Map<number, string>>;

  findImageAnnotationsForInstance(
    instanceFilter: Image360AnnotationInstanceReference<T>,
    collection: DefaultImage360Collection<T>
  ): Promise<Image360AnnotationAssetQueryResult<T>[]>;

  getAllImage360AnnotationInfos(
    source: 'assets',
    collection: DefaultImage360Collection<T>,
    annotationFilter: Image360AnnotationFilterDelegate<T>
  ): Promise<AssetAnnotationImage360Info<ClassicDataSourceType>[]>;
  getAllImage360AnnotationInfos(
    source: 'hybrid',
    collection: DefaultImage360Collection<T>,
    annotationFilter: Image360AnnotationFilterDelegate<T>
  ): Promise<AssetHybridAnnotationImage360Info[]>;
  getAllImage360AnnotationInfos(
    source: 'cdm',
    collection: DefaultImage360Collection<T>,
    annotationFilter: Image360AnnotationFilterDelegate<T>
  ): Promise<AssetAnnotationImage360Info<DMDataSourceType>[]>;
  getAllImage360AnnotationInfos(
    source: 'all',
    collection: DefaultImage360Collection<T>,
    annotationFilter: Image360AnnotationFilterDelegate<T>
  ): Promise<AssetAnnotationImage360Info<DataSourceType>[]>;
  getAllImage360AnnotationInfos(
    source: 'assets' | 'hybrid' | 'cdm' | 'all',
    collection: DefaultImage360Collection<T>,
    annotationFilter: Image360AnnotationFilterDelegate<T>
  ): Promise<
    | AssetAnnotationImage360Info<ClassicDataSourceType>[]
    | AssetAnnotationImage360Info<DMDataSourceType>[]
    | AssetAnnotationImage360Info<DataSourceType>[]
    | AssetHybridAnnotationImage360Info[]
  >;
}

export interface Image360DescriptorProvider<T extends DataSourceType> {
  get360ImageDescriptors(
    metadataFilter: T['image360Identifier'],
    preMultipliedRotation: boolean
  ): Promise<Historical360ImageSet<T>[]>;
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
  data: AnnotationsTypesImagesAssetLink;
};

/**
 * A CDF AnnotationModel with a narrower type representing an image instance link
 */
export type ImageInstanceLinkAnnotationInfo = Omit<AnnotationModel, 'data'> & {
  /**
   * The data associated with the image instance link
   */
  data: AnnotationsTypesImagesInstanceLink;
};

export type Historical360ImageSet<T extends DataSourceType> = Image360RevisionDescriptor<T> & {
  imageRevisions: Image360Descriptor<T>[];
};

export type Image360Descriptor<T extends DataSourceType> = {
  id: Image360RevisionId<T>;
  timestamp?: number | string;
  faceDescriptors: Image360FileDescriptor[];
};

export type Image360RevisionDescriptor<T extends DataSourceType> = {
  id: Image360RevisionId<T>;
  label: string | undefined;
  collectionId: string;
  collectionLabel: string | undefined;
  transform: Matrix4;
};

export type FaceName = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';

export type Image360Face = {
  face: FaceName;
  mimeType: 'image/jpeg' | 'image/png';
  data: ArrayBuffer;
  /** Signed download URL for streaming. When present, data is empty. */
  downloadUrl?: string;
};

export type Image360Texture = {
  face: FaceName;
  texture: Texture;
};

export type Image360FileDescriptor = {
  face: FaceName;
  mimeType: 'image/jpeg' | 'image/png';
  /** Internal CDF file ID (numeric) */
  fileId?: number;
  /** External file ID (string) - for system-space/FDM collections */
  externalId?: string;
  /** DM instance reference - for CDM collections */
  instanceId?: DMInstanceRef;
};

export enum File3dFormat {
  EptPointCloud = 'ept-pointcloud',
  /**
   * Reveal v9 and above (GLTF based output)
   */
  GltfCadModel = 'gltf-directory',
  /**
   * High-detail geometry for a prioritized subset of nodes.
   * Same GLTF structure as GltfCadModel but only contains
   * geometry for nodes specified in a PrioritizedNodes job.
   */
  GltfPrioritizedNodes = 'gltf-prioritized-nodes-directory',
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
} & DMInstanceRef;

export type Source = {
  type: 'view';
  version: string;
} & DMInstanceRef;

export type EdgeItem = {
  startNode: DMInstanceRef;
  endNode: DMInstanceRef;
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
    direction?: 'outwards' | 'inwards';
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
      [B in MainSourceProperties<T, K>[number]]: string | number | DMInstanceRef;
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
