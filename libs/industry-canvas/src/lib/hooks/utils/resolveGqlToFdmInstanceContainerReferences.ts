import { CopilotDataModelQueryResponse } from '@fusion/copilot-core';
import { FdmMixerApiService } from '@fusion/data-modeling';
import { v4 as uuid } from 'uuid';

import { CogniteClient } from '@cognite/sdk';

import {
  ContainerReferenceType,
  FdmInstanceContainerReference,
} from '../../types';

const resolveGqlToFdmInstanceContainerReferences = async (
  sdk: CogniteClient,
  { graphql, dataModel }: CopilotDataModelQueryResponse
): Promise<FdmInstanceContainerReference[]> => {
  const client = new FdmMixerApiService(sdk);
  const model = await client.getDataModelVersionsById(
    dataModel.space,
    dataModel.externalId
  );

  if (model === undefined) {
    throw new Error('Data model not found');
  }

  // TODO need to think about aggregate results
  const { data: response } = await client.runQuery({
    dataModelId: dataModel.externalId,
    space: dataModel.space,
    schemaVersion: dataModel.version,
    graphQlParams: graphql,
  });

  if (response === undefined) {
    throw new Error('Response is undefined');
  }

  // TODO: I'm not reliably getting GQLs, so it's difficult to test
  console.log(response);

  // TODO: Please complete here.
  // Check FdmInstanceContainerReference type for more information.
  return Object.values(
    (response as {
      someKey: { items: { space: string; externalId: string }[] };
    }) || { someKey: { items: [] } }
  )[0].items.map((item) => ({
    id: uuid(),
    type: ContainerReferenceType.FDM_INSTANCE,
    instanceExternalId: item.externalId,
    instanceSpace: item.space,
    viewExternalId: dataModel.view,
    viewSpace: dataModel.space,
    viewVersion: dataModel.viewVersion, // If not specified, the latest version of the view is used
    // dont think u need this?
    label: 'COMPLETE ME', // ?
  }));
};

export default resolveGqlToFdmInstanceContainerReferences;
