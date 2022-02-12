import { useContext } from 'react';
import { useQuery } from 'react-query';
import { Model3D } from '@cognite/sdk';
import { CogniteSDKContext } from 'providers/CogniteSDKProvider';

const useModelsQuery = () => {
  const { client } = useContext(CogniteSDKContext);

  const query = useQuery<Model3D[]>(['allModels'], () =>
    client.models3D.list({ published: true }).then((res) => res.items)
  );
  return query;
};

export default useModelsQuery;
