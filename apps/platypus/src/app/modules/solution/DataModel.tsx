import { Body } from '@cognite/cogs.js';
import { BasicPlaceholder } from '@platypus-app/components/BasicPlaceholder/BasicPlaceholder';
import { NavigationDataModel } from '@platypus-app/components/Navigations/NavigationDataModel';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import {
  useDataModelVersions,
  useSelectedDataModelVersion,
} from '@platypus-app/hooks/useDataModelActions';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { lazy } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';

const DataPage = lazy(() =>
  import('./DataLayout').then((module) => ({
    default: module.DataLayout,
  }))
);

export const DataModel = () => {
  const { t } = useTranslation('DataModel');

  const { dataModelExternalId, space, version } = useParams();

  const {
    data: dataModelVersions,
    isLoading: areDataModelVersionsLoading,
    error: dataModelError,
  } = useDataModelVersions(dataModelExternalId!, space!);

  const selectedDataModelVersion = useSelectedDataModelVersion(
    version || '',
    dataModelVersions || [],
    dataModelExternalId || '',
    space || ''
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

  if (areDataModelVersionsLoading) {
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
