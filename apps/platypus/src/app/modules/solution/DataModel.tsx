import { BasicPlaceholder } from '@platypus-app/components/BasicPlaceholder/BasicPlaceholder';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import {
  useDataModel,
  useDataModelVersions,
  useSelectedDataModelVersion,
} from '@platypus-app/hooks/useDataModelActions';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { lazy, useEffect, useState } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { useDataModelState } from './hooks/useDataModelState';

const DataPage = lazy(() =>
  import('./DataLayout').then((module) => ({
    default: module.DataLayout,
  }))
);

export const DataModel = () => {
  const { t } = useTranslation('DataModel');

  const { dataModelExternalId, version } = useParams();
  const {
    setCurrentTypeName,
    setSelectedVersionNumber,
    clearState,
    setGraphQlSchema,
    setSelectedDataModelVersion,
  } = useDataModelState();

  const [isReady, setIsReady] = useState(false);

  const {
    data: dataModel,
    isLoading: isDataModelLoading,
    isError: hasDataModelError,
    isSuccess: isDataModelLoaded,
  } = useDataModel(dataModelExternalId);

  const {
    data: dataModelVersions,
    isLoading: areDataModelVersionsLoading,
    isError: hasDataModelVersionError,
    isSuccess: areDataModelVersionsLoaded,
  } = useDataModelVersions(dataModelExternalId);

  // Keep this here, we need to have this loaded before any other child page is being loaded
  // Otherwise you will end up having race condition and unpredictable state
  // Think twice before changing anything from here!
  const selectedDataModelVersion = useSelectedDataModelVersion(
    version || '',
    dataModelVersions || [],
    dataModelExternalId || '',
    dataModel?.space || ''
  );

  // Init livecycle hook, need to run first before everything else
  // Run after data is loaded or selected schema is being changed
  useEffect(
    () => {
      // wait for both requests to finish and update redux store
      if (
        isDataModelLoaded &&
        areDataModelVersionsLoaded &&
        selectedDataModelVersion
      ) {
        // Reset any previous state in redux
        // we don't want to deal with any dirty state from before
        clearState();

        // set the current graphql schema in store
        // this will parse typeDefs, validate and few other things
        // keep it here if you want to have predictable state
        // and keep react-query and redux playing nicely

        setGraphQlSchema(selectedDataModelVersion.schema);
        // set selected version based on the param in the route we landed on
        setSelectedVersionNumber(version || '');
        setSelectedDataModelVersion(selectedDataModelVersion);
        setCurrentTypeName(null);
        setIsReady(true);
      }
    },
    // eslint-disable-next-line
    [
      isDataModelLoaded,
      areDataModelVersionsLoaded,
      version, // run when version in url is changed
      selectedDataModelVersion.schema, // run when selected schema is changed
      selectedDataModelVersion.externalId, // or run when externalId is changed
    ]
  );

  if (hasDataModelError || hasDataModelVersionError) {
    return (
      <div data-testid="data_model_not_found">
        <BasicPlaceholder
          type="Documents"
          title={t(
            'data_model_not_found',
            'Something went wrong, we were not able to load the Data Model!'
          )}
        />
      </div>
    );
  }

  if (isDataModelLoading || areDataModelVersionsLoading || !isReady) {
    return (
      <div data-testid="data_model_loader">
        <Spinner />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="*" element={<DataPage />} />
    </Routes>
  );
};
