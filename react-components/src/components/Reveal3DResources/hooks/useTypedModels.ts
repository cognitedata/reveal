import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  type AddModelOptions,
  type ClassicDataSourceType,
  type DataSourceType,
  type Cognite3DViewer
} from '@cognite/reveal';
import {
  type TypedReveal3DModel,
  type AddResourceOptions,
  type AddPointCloudResourceOptions,
  type AddCadResourceOptions
} from '../types';
import { useCadOrPointCloudResources } from './useCadOrPointCloudResources';
import { useClassicModelOptions } from './useClassicModelOptions';
import { useEffect } from 'react';
import { useReveal3DResourceLoadFailCount } from '../Reveal3DResourcesInfoContext';

export const useTypedModels = (
  viewer: Cognite3DViewer<DataSourceType>,
  resources: AddResourceOptions[],
  onLoadFail?: (resource: AddResourceOptions, error: any) => void
): UseQueryResult<TypedReveal3DModel[]> => {
  const cadOrPointCloudResources = useCadOrPointCloudResources(resources);
  const classicModelOptions = useClassicModelOptions(cadOrPointCloudResources);
  const typeResult = useQuery({
    queryKey: ['typedModels', classicModelOptions, cadOrPointCloudResources],
    queryFn: async () =>
      await getTypedModels(classicModelOptions, viewer, cadOrPointCloudResources, onLoadFail),
    staleTime: Infinity,
    enabled: classicModelOptions.length > 0 && cadOrPointCloudResources.length > 0
  });

  useRegisterFailedResources(typeResult, cadOrPointCloudResources);

  return typeResult;
};

const getTypedModels = async (
  classicModelOptions: Array<AddModelOptions<ClassicDataSourceType>>,
  viewer: Cognite3DViewer<DataSourceType>,
  cadOrPointCloudResources: Array<AddModelOptions<DataSourceType>>,
  onLoadFail?: (resource: AddResourceOptions, error: any) => void
): Promise<TypedReveal3DModel[]> => {
  const errorFunction = onLoadFail ?? defaultLoadFailHandler;

  const modelTypePromises = classicModelOptions.map(async (classicModelOptions, index) => {
    const { modelId, revisionId } = classicModelOptions;
    const type = await viewer.determineModelType(modelId, revisionId).catch((error) => {
      errorFunction(classicModelOptions, error);
      return '';
    });

    const typedModel = {
      ...cadOrPointCloudResources[index],
      type,
      ...(type === 'cad' && { modelId, revisionId })
    };
    return typedModel;
  });

  const resourceLoadResults = await Promise.all(modelTypePromises);
  const successfullyLoadedResources = resourceLoadResults.filter(
    (p): p is TypedReveal3DModel => p.type === 'cad' || p.type === 'pointcloud'
  );

  return successfullyLoadedResources;
};

function useRegisterFailedResources(
  typeResult: UseQueryResult<TypedReveal3DModel[]>,
  cadOrPointCloudResources: Array<AddCadResourceOptions | AddPointCloudResourceOptions>
): void {
  const { setReveal3DResourceLoadFailCount } = useReveal3DResourceLoadFailCount();

  useEffect(() => {
    if (typeResult.data === undefined || typeResult.isLoading) {
      return;
    }

    const numResourcesFailed = cadOrPointCloudResources.length - typeResult.data.length;

    setReveal3DResourceLoadFailCount((p) => p + numResourcesFailed);
    return () => {
      setReveal3DResourceLoadFailCount((p) => p - numResourcesFailed);
    };
  }, [typeResult.data, typeResult.isLoading, cadOrPointCloudResources]);
}

const defaultLoadFailHandler = (resource: AddResourceOptions, error: any): void => {
  console.warn(`Could not load resource ${JSON.stringify(resource)}: ${JSON.stringify(error)}`);
};
