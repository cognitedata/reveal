import { DASH } from '../constants';

export const getMetadataValueByKey = (
  key: string,
  metadata?: { [key: string]: string }
): string => {
  if (!metadata) return DASH;

  const actualKey = Object.keys(metadata).find(
    (metadataKey) => metadataKey.toLowerCase() === key.toLowerCase()
  );

  return actualKey ? metadata[actualKey] : DASH;
};
