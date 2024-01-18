/*!
 * Copyright 2023 Cognite AS
 */
import { useEffect, type ReactElement } from 'react';

import {
  type AssetMapping3D,
  type AssetMappings3DListFilter,
  type CogniteClient
} from '@cognite/sdk';
import { type AddModelOptions } from '@cognite/reveal';
import { useSDK } from '../RevealContainer/SDKProvider';

export type ColorOverlayProps = {
  addModelOptions: AddModelOptions;
  rules: any;
};

export function ColorOverlayRules({ addModelOptions, rules }: ColorOverlayProps): ReactElement {
  const cdfClient = useSDK();
  console.log(' RULES', rules);
  console.log(' SDK', cdfClient);

  const { modelId, revisionId } = addModelOptions;

  useEffect(() => {
    const getContextualization = async (): Promise<void> => {
      // const models = sdk.models;
      const contextualizedNodes = await getCdfCadContextualization({
        sdk: cdfClient,
        modelId,
        revisionId,
        nodeId: undefined,
        assetId: undefined
      });

      console.log(' contextualizedNodes ', contextualizedNodes);
    };
    void getContextualization();
  }, []);

  return <></>;
}

const createFilter = ({
  nodeId,
  assetId
}: {
  nodeId: number | undefined;
  assetId: number | undefined;
}): AssetMappings3DListFilter => {
  return {
    nodeId,
    assetId
  };
};

const getCdfCadContextualization = async ({
  sdk,
  modelId,
  revisionId,
  nodeId,
  assetId
}: {
  sdk: CogniteClient;
  modelId: number;
  revisionId: number;
  nodeId: number | undefined;
  assetId: number | undefined;
}): Promise<AssetMapping3D[]> => {
  const filter = createFilter({ nodeId, assetId });

  return await sdk.assetMappings3D
    .list(modelId, revisionId, filter)
    .autoPagingToArray({ limit: Infinity });
};
