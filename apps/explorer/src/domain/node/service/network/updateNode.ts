import { CogniteClient } from '@cognite/sdk';

interface Props {
  client: CogniteClient;
  spaceName: string;
  modelName: string;
  items: unknown[];
}
export const updateNode = async ({
  client,
  spaceName,
  modelName,
  items,
}: Props) => {
  try {
    const createNodesResponse = await client.post(
      `api/v1/projects/${client.project}/datamodelstorage/nodes`,
      {
        data: {
          spaceExternalId: spaceName,
          model: [spaceName, modelName],
          overwrite: true,
          items,
        },
        headers: {
          'cdf-version': 'alpha',
        },
      }
    );

    return createNodesResponse.status;
  } catch (error) {
    // console.log('error', error);
    // logError(JSON.stringify(error));
    return false;
  }
};
