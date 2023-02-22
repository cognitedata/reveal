import { Body } from '@cognite/cogs.js';
import { BasicPlaceholder } from '@platypus-app/components/BasicPlaceholder/BasicPlaceholder';
import { NavigationDataModel } from '@platypus-app/components/Navigations/NavigationDataModel';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import {
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

  const { dataModelExternalId, space, version } = useParams();
  const {
    setCurrentTypeName,
    setSelectedVersionNumber,
    clearState,
    setGraphQlSchema,
    setSelectedDataModelVersion,
  } = useDataModelState();

  const [isReady, setIsReady] = useState(false);

  const {
    data: dataModelVersions,
    isLoading: areDataModelVersionsLoading,
    error: dataModelError,
    isSuccess: areDataModelVersionsLoaded,
  } = useDataModelVersions(dataModelExternalId!, space!);

  // Keep this here, we need to have this loaded before any other child page is being loaded
  // Otherwise you will end up having race condition and unpredictable state
  // Think twice before changing anything from here!
  const selectedDataModelVersion = useSelectedDataModelVersion(
    version || '',
    dataModelVersions || [],
    dataModelExternalId || '',
    space || ''
  );

  const selectedDataModelVersionGraphQlSchema =
    selectedDataModelVersion && selectedDataModelVersion.schema;
  const selectedDataModelVersionExternalId =
    selectedDataModelVersion && selectedDataModelVersion.externalId;

  // Init livecycle hook, need to run first before everything else
  // Run after data is loaded or selected schema is being changed
  useEffect(
    () => {
      // wait for both requests to finish and update redux store
      if (areDataModelVersionsLoaded && selectedDataModelVersion) {
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
      areDataModelVersionsLoaded,
      version, // run when version in url is changed
      selectedDataModelVersionGraphQlSchema, // run when selected schema is changed
      selectedDataModelVersionExternalId, // or run when externalId is changed
    ]
  );

  if (dataModelError || !selectedDataModelVersion) {
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
            {dataModelError
              ? dataModelError.message.includes('space')
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

  if (areDataModelVersionsLoading || !isReady) {
    return (
      <div data-testid="data_model_loader">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <NavigationDataModel />
      <Routes>
        <Route path="*" element={<DataPage />} />
      </Routes>
    </>
  );
};
