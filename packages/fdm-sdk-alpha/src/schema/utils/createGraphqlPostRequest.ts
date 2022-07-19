import { CogniteClient } from '@cognite/sdk';

export const createGraphqlPostRequest = async <T>(
  client: CogniteClient,
  query: unknown
): Promise<T | Error> => {
  try {
    const url = `api/v1/projects/${client.project}/schema/graphql`;

    const response = await client.post<T>(url, {
      data: query,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    return error as Error;
  }
};
