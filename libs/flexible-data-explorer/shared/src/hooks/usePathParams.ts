import { useParams } from 'react-router-dom';

export const useDataModelPathParams = () => {
  const { dataModel, space, version } = useParams<{
    dataModel: string;
    space: string;
    version: string;
  }>();

  return {
    dataModel,
    space,
    version,
  };
};

export const useInstancePathParams = () => {
  const { dataType, instanceSpace, externalId } = useParams<{
    dataType: string;
    instanceSpace: string;
    externalId: string;
  }>();

  return {
    dataType,
    instanceSpace,
    externalId,
  };
};
