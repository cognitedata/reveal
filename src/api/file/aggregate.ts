import { v3Client as client } from '@cognite/cdf-sdk-singleton';

export const totalFileCount = async (filter: {}) => {
  const aggregates = await client.files.aggregate({
    filter,
  });
  return aggregates[0].count;
};
