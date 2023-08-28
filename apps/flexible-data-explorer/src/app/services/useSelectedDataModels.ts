import { useParams } from 'react-router-dom';

import { useSiteConfig } from '../hooks/useConfig';
import { useDataModelsLocalStorage } from '../hooks/useLocalStorage';
import { useDataModelsParams } from '../hooks/useParams';

import { DataModelV2 } from './types';

export const useSelectedDataModels = (): DataModelV2[] | undefined => {
  const [dataModelsParam] = useDataModelsParams();
  const siteConfig = useSiteConfig();
  const [dataModelsLocalStorage] = useDataModelsLocalStorage();
  const { dataModel, version, space } = useParams();

  // This allows for sharing links to the instance page (even if you do not have the data model selected)
  let pathDataModel: DataModelV2[] | undefined;

  if (dataModel && version && space) {
    pathDataModel = [
      {
        externalId: dataModel,
        version,
        space,
      },
    ];
  }

  return (
    pathDataModel ||
    dataModelsParam ||
    siteConfig?.dataModels ||
    dataModelsLocalStorage
  );
};
