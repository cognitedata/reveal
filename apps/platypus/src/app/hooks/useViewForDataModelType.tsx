import { TOKENS } from '@platypus-app/di';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { useQuery } from '@tanstack/react-query';

import { useInjection } from './useInjection';

/*
Fetches a data model from DMS instead of the Mixer API so that we have access to its view
references, and returns the view that matches the given viewExternalId. Useful for
getting a view's version for example, since it is auto-generated if not explicitly set.
*/
export const useViewForDataModelType = ({
  space,
  dataModelExternalId,
  dataModelVersion,
  viewExternalId,
}: {
  space: string;
  dataModelExternalId: string;
  dataModelVersion: string;
  viewExternalId: string;
}) => {
  const dataModelsHandler = useInjection(TOKENS.dataModelsHandler);

  const useQueryResponse = useQuery(
    QueryKeys.DATA_MODEL_FROM_DMS(space, dataModelExternalId, dataModelVersion),
    async () => {
      return await dataModelsHandler.fetchDataModelFromDMS({
        dataModelId: dataModelExternalId,
        space: space,
        version: dataModelVersion,
      });
    }
  );

  if (!useQueryResponse.data) {
    return useQueryResponse;
  }

  /*
  We have to filter out the view outside of the useQuery fetching function because that
  query will not rerun when viewExternalId changes
  */
  const view = useQueryResponse.data
    .getValue()
    .views!.find((v) => v.externalId === viewExternalId);

  return {
    ...useQueryResponse,
    data: view,
  };
};
