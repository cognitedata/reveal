import { Image360Provider } from './Image360Provider';
import { DataSourceType } from './DataSourceType';
import {
  Historical360ImageSet,
  Image360AnnotationFilterDelegate,
  Image360AnnotationProvider,
  Image360AnnotationSpecifier,
  Image360DescriptorProvider,
  Image360Face,
  Image360FileDescriptor,
  Image360FileProvider,
  InstanceReference
} from './types';
import {
  AssetAnnotationImage360Info,
  DefaultImage360Collection,
  Image360AnnotationAssetQueryResult
} from '@reveal/360-images';

export class Image360ProviderCombiner<T extends DataSourceType> implements Image360Provider<T> {
  private readonly _descriptorProvider: Image360DescriptorProvider<T>;
  private readonly _fileProvider: Image360FileProvider;
  private readonly _annotationProvider: Image360AnnotationProvider<T>;

  constructor(
    descriptorProvider: Image360DescriptorProvider<T>,
    fileProvider: Image360FileProvider,
    annotationProvider: Image360AnnotationProvider<T>
  ) {
    this._descriptorProvider = descriptorProvider;
    this._fileProvider = fileProvider;
    this._annotationProvider = annotationProvider;
  }

  get360ImageDescriptors(
    metadataFilter: T['image360Identifier'],
    preMultipliedRotation: boolean
  ): Promise<Historical360ImageSet<T>[]> {
    return this._descriptorProvider.get360ImageDescriptors(metadataFilter, preMultipliedRotation);
  }

  get360ImageFiles(
    image360FaceDescriptors: Image360FileDescriptor[],
    abortSignal?: AbortSignal
  ): Promise<Image360Face[]> {
    return this._fileProvider.get360ImageFiles(image360FaceDescriptors, abortSignal);
  }

  getLowResolution360ImageFiles(
    image360FaceDescriptors: Image360FileDescriptor[],
    abortSignal?: AbortSignal
  ): Promise<Image360Face[]> {
    return this._fileProvider.getLowResolution360ImageFiles(image360FaceDescriptors, abortSignal);
  }

  getRelevant360ImageAnnotations(
    annotationSpecifier: Image360AnnotationSpecifier<T>
  ): Promise<T['image360AnnotationType'][]> {
    return this._annotationProvider.getRelevant360ImageAnnotations(annotationSpecifier);
  }

  findImageAnnotationsForInstance(
    instanceFilter: InstanceReference<T>,
    collection: DefaultImage360Collection<T>
  ): Promise<Image360AnnotationAssetQueryResult<T>[]> {
    return this._annotationProvider.findImageAnnotationsForInstance(instanceFilter, collection);
  }

  getAllImage360AnnotationInfos(
    collection: DefaultImage360Collection<T>,
    annotationFilter: Image360AnnotationFilterDelegate<T>
  ): Promise<AssetAnnotationImage360Info<T>[]> {
    return this._annotationProvider.getAllImage360AnnotationInfos(collection, annotationFilter);
  }
}
