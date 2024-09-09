/*!
 * Copyright 2024 Cognite AS
 */
import { type CogniteClient, type Model3D } from '@cognite/sdk';

export const useFetchModels = async (sdk: CogniteClient): Promise<Model3D[]> => {
  return await sdk.models3D.list().autoPagingToArray({ limit: Infinity });
};
