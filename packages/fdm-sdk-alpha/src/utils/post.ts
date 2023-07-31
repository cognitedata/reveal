import { CogniteClient } from '@cognite/sdk';

export const post = <Data>({
  client,
  url,
  headers,
  data,
}: {
  client: CogniteClient;
  url: string;
  headers: { [x: string]: string };
  data: Data;
}) => {
  return client.post(`api/v1/projects/${client.project}/${url}`, {
    data,
    headers,
  });
};

export const postDMS = <Data>({
  client,
  data,
  url,
}: {
  client: CogniteClient;
  data: Data;
  url: string;
}) => {
  return post<Data>({
    client,
    data,
    url: `datamodelstorage/${url}`,
    headers: {
      'cdf-version': 'alpha',
    },
  });
};
