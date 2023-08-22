import {
  getUrlParameters,
  useModelInstancesList,
} from '@fusion/contextualization';

import { convertToInternalModelInstance } from '../utils/convertToInternalModelInstance';

export const useGetMatchInputInstances = () => {
  const { space, versionNumber, dataModelType } = getUrlParameters();
  const { data } = useModelInstancesList(space, dataModelType, versionNumber);

  const matchInputInstances = convertToInternalModelInstance(
    data,
    space,
    dataModelType,
    versionNumber
  );

  return matchInputInstances;
};
