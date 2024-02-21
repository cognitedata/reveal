/*!
 * Copyright 2023 Cognite AS
 */
import { useEffect, type ReactElement, useMemo } from 'react';

import { CogniteCadModel, CogniteModel } from '@cognite/reveal';
import { useAllMappedEquipmentAssetMappings, useReveal } from '../..';
import { Color } from 'three';
import { type RuleOutputSet } from './types';
import { generateRuleBasedOutputs } from './utils';
import { type FdmPropertyType } from '../Reveal3DResources/types';

export type ColorOverlayProps = {
  ruleSet: RuleOutputSet | Record<string, any> | FdmPropertyType<Record<string, any>> | undefined;
};

export function RuleBasedOutputsSelector({ ruleSet }: ColorOverlayProps): ReactElement | undefined {
  const viewer = useReveal();

  const models = useMemo(() => {
    return viewer.models;
  }, [viewer.models.length]);

  const {
    data: assetMappings,
    isFetching,
    hasNextPage,
    fetchNextPage
  } = useAllMappedEquipmentAssetMappings(models);

  useEffect(() => {
    if (!isFetching && hasNextPage === true) {
      void fetchNextPage();
    }
  }, [isFetching, hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (assetMappings === undefined || isFetching) return;

    clearAllModelStyling(models);

    if (ruleSet === undefined) return;

    const initializeRuleBasedOutputs = async (model: CogniteCadModel): Promise<void> => {
      // parse assets and mappings
      // TODO: refactor to be sure to filter only the mappings/assets for the current model within the pages
      const flatAssetsMappingsList =
        assetMappings?.pages
          .flat()
          .map((item) => item.mappings)
          .flat() ?? [];
      const flatMappings = flatAssetsMappingsList.map((node) => node.items).flat();
      const contextualizedAssetNodes =
        assetMappings?.pages
          .flat()
          .map((item) => item.assets)
          .flat() ?? [];

      // ========= Generate Rule Based Outputs
      generateRuleBasedOutputs(model, contextualizedAssetNodes, flatMappings, ruleSet);
    };

    models.forEach((model) => {
      void initializeRuleBasedOutputs(model as CogniteCadModel);
    });
  }, [assetMappings, ruleSet, models]);

  return <></>;
}

function clearAllModelStyling(models: CogniteModel[]): void {
  // clean up the appearance
  models.forEach((model) => {
    if (!(model instanceof CogniteCadModel)) {
      return;
    }
    model.removeAllStyledNodeCollections();

    model.setDefaultNodeAppearance({
      color: new Color('#efefef')
    });
  });
}
