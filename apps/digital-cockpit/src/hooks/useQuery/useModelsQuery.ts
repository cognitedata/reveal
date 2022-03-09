import { useQuery } from 'react-query';
import { Model3D } from '@cognite/sdk';
import useCDFExplorerContext from 'hooks/useCDFExplorerContext';

const useModelsQuery = () => {
  const { client } = useCDFExplorerContext();

  const query = useQuery<Model3D[]>(['allModels'], () =>
    client.models3D.list({ published: true }).then((res) => res.items)
  );
  return query;
};

export default useModelsQuery;
