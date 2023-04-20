import { Body } from '@cognite/cogs.js';
import { BasicPlaceholder } from '@platypus-app/components/BasicPlaceholder/BasicPlaceholder';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { useSelectedDataModelVersion } from '@platypus-app/hooks/useSelectedDataModelVersion';
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

  const { dataModelExternalId, space, version } = useParams() as {
    dataModelExternalId: string;
    space: string;
    version: string;
  };

  const {
    dataModelVersion: selectedDataModelVersion,
    isLoading,
    error,
  } = useSelectedDataModelVersion(version, dataModelExternalId, space);

  if (isLoading) {
    return (
      <div data-testid="data_model_loader">
        <Spinner />
      </div>
    );
  }

  if (error || !selectedDataModelVersion) {
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
    <>
      <Routes>
        <Route path="*" element={<DataPage />} />
      </Routes>
    </>
  );
};
