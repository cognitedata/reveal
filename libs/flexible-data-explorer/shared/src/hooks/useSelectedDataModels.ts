import { useParams } from 'react-router-dom';

import { DataModelV2 } from '../types/services';

import { useSelectedSiteConfig } from './useConfig';
import { useDataModelsLocalStorage } from './useLocalStorage';
import { useDataModelsParams } from './useParams';

export const useSelectedDataModels = (): DataModelV2[] | undefined => {
  const [dataModelsParam] = useDataModelsParams();
  const siteConfig = useSelectedSiteConfig();
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
