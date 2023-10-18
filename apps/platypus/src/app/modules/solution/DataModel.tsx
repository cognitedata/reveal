import { lazy } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';

import { getQueryParameter } from '@cognite/cdf-utilities';

import { DMContextProvider } from '../../context/DMContext';

const DataPage = lazy(() =>
  import('./DataLayout').then((module) => ({
    default: module.DataLayout,
  }))
);

export const DataModel = () => {
  const { dataModelExternalId, space, version } = useParams() as {
    dataModelExternalId: string;
    space: string;
    version: string;
  };

  const selectedTypeNameFromQuery = getQueryParameter('type');

  return (
    <DMContextProvider
      externalId={dataModelExternalId}
      space={space}
      version={version}
      dataTypeName={selectedTypeNameFromQuery as string | undefined}
    >
      <Routes>
        <Route path="*" element={<DataPage />} />
      </Routes>
    </DMContextProvider>
  );
};
