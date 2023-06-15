import { useParams } from 'react-router-dom';

export const useDataModelParams = () => {
  const { dataModel, space, version } = useParams();
  if (dataModel && space && version) {
    return { dataModel, space, version };
  } else return undefined;
};
