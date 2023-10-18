import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  DataModelTypeDefs,
  DataModelTypeDefsType,
  DataModelVersion,
  DataModelVersionStatus,
} from '@fusion/data-modeling';

import { Body } from '@cognite/cogs.js';

import { BasicPlaceholder } from '../components/BasicPlaceholder/BasicPlaceholder';
import { Spinner } from '../components/Spinner/Spinner';
import {
  useDataModel,
  useDataModelVersions,
} from '../hooks/useDataModelActions';
import { useTranslation } from '../hooks/useTranslation';
import { DEFAULT_VERSION_PATH } from '../utils/config';

import { initDMWorker } from './dmWorkerLoader';

export type DMContext = {
  typeDefs: DataModelTypeDefs;
  latestDataModel: DataModelVersion;
  selectedDataModel: DataModelVersion;
  versions: DataModelVersion[];
  selectedDataType?: DataModelTypeDefsType;
  refetchDataModelVersions: () => void;
};

export const DMContext = createContext<DMContext>({} as DMContext);

export const DMContextProvider = ({
  children,
  space,
  externalId,
  version,
  dataTypeName,
  overrideGraphQLDML,
}: {
  // Overrides everything
  overrideGraphQLDML?: string;
  children: JSX.Element;
  space: string;
  externalId: string;
  version: string;
  dataTypeName?: string;
}) => {
  const { t } = useTranslation('DataModel');
  const [worker, setWorker] = useState<Worker | undefined>();
  useEffect(() => {
    initDMWorker().then((newWorker) => {
      setWorker(newWorker);
    });
    return () => {
      setWorker((currWorker) => {
        currWorker?.terminate();
        return undefined;
      });
    };
  }, []);

  const {
    data: dataModelVersions = [],
    isLoading,
    error,
    refetch: refetchDataModelVersions,
  } = useDataModelVersions(externalId, space);

  const { data: dataModel, isLoading: isLoadingDataModel } = useDataModel(
    externalId,
    space
  );

  const defaultDataModel = useMemo(
    () =>
      ({
        schema: '',
        space,
        externalId: externalId,
        status: DataModelVersionStatus.DRAFT,
        version: '1',
        name: dataModel?.name,
        description: dataModel?.description,
        createdTime: Date.now(),
        lastUpdatedTime: Date.now(),
        views: [],
      } as DataModelVersion),
    [dataModel, externalId, space]
  );

  const latestDataModel = useMemo(() => {
    // if no published versions, return a default
    if (!dataModelVersions?.length) {
      return defaultDataModel;
    }
    // if version number is "latest"
    return dataModelVersions[0];
  }, [dataModelVersions, defaultDataModel]);

  const selectedDataModel = useMemo(() => {
    // if no published versions, return a default
    if (!dataModelVersions?.length) {
      return defaultDataModel;
    }
    if (version === DEFAULT_VERSION_PATH) {
      return latestDataModel;
    }
    // else find matching version number
    return dataModelVersions.find((schema) => schema.version === version);
  }, [dataModelVersions, defaultDataModel, version, latestDataModel]);

  const [typeDefs, setTypeDefs] = useState<DataModelTypeDefs>({
    types: [],
    directives: [],
  });

  const selectedDataType = useMemo(
    () =>
      dataTypeName
        ? typeDefs.types.find((type) => type.name === dataTypeName)
        : undefined,
    [typeDefs.types, dataTypeName]
  );

  const preReq = useMemo(() => {
    return {
      dml: overrideGraphQLDML || selectedDataModel?.schema,
      views: overrideGraphQLDML ? [] : selectedDataModel?.views,
    };
  }, [overrideGraphQLDML, selectedDataModel]);

  const refetch = useCallback(async () => {
    return new Promise((resolve, _reject) => {
      if (worker) {
        worker.onmessage = (e: MessageEvent<DataModelTypeDefs>) => {
          setTypeDefs(e.data);
          resolve(e.data);
        };
        worker.postMessage(preReq);
      }
    });
  }, [worker, preReq]);

  // Reload when the worker is ready or when the initial parameter change (graphQL string, space/externalId/version)
  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading || isLoadingDataModel) {
    return (
      <div data-testid="data_model_loader">
        <Spinner />
      </div>
    );
  }

  if (error || !selectedDataModel) {
    return (
      <div data-testid="data_model_not_found">
        <BasicPlaceholder
          type="EmptyStateFolderSad"
          title={t(
            'data_model_not_found',
            "Something went wrong. We couldn't load the data model."
          )}
        >
          <Body level={5}>
            {error
              ? error.message.includes('space')
                ? t(
                    'space_not_found_details',
                    'Are you sure you have access to the space?'
                  )
                : t(
                    'data_model_not_found_details',
                    'Are you sure you have access to the data model?'
                  )
              : t(
                  'version_not_found_details',
                  'Are you sure this version of data model exists?'
                )}
          </Body>
        </BasicPlaceholder>
      </div>
    );
  }

  return (
    <DMContext.Provider
      value={{
        typeDefs,
        selectedDataModel,
        latestDataModel,
        selectedDataType: selectedDataType,
        versions: dataModelVersions,
        refetchDataModelVersions,
      }}
    >
      {children}
    </DMContext.Provider>
  );
};

export const useDMContext = () => {
  return useContext(DMContext);
};
