import { createContext } from 'react';
import { useTranslation } from '../../i18n/I18n';
import { useFetchRuleInstances } from '../../RuleBasedOutputs/hooks/useFetchRuleInstances';
import { use3dModels } from '../../../hooks/use3dModels';
import { useAssetMappedNodesForRevisions } from '../../../hooks/cad';
import { useReveal3DResourcesStylingLoading } from '../../Reveal3DResources/Reveal3DResourcesInfoContext';
import { RuleBasedOutputsSelector } from '../../RuleBasedOutputs/RuleBasedOutputsSelector';
import { RuleBasedSelectionItem } from '../../RuleBasedOutputs/components/RuleBasedSelectionItem';

export type RuleBasedOutputsButtonDependencies = {
  useTranslation: typeof useTranslation;
  useFetchRuleInstances: typeof useFetchRuleInstances;
  use3dModels: typeof use3dModels;
  useAssetMappedNodesForRevisions: typeof useAssetMappedNodesForRevisions;
  useReveal3DResourcesStylingLoading: typeof useReveal3DResourcesStylingLoading;
  RuleBasedOutputsSelector: typeof RuleBasedOutputsSelector;
  RuleBasedSelectionItem: typeof RuleBasedSelectionItem;
};

export const defaultRuleBasedOutputsButtonDependencies: RuleBasedOutputsButtonDependencies = {
  useTranslation,
  useFetchRuleInstances,
  use3dModels,
  useAssetMappedNodesForRevisions,
  useReveal3DResourcesStylingLoading,
  RuleBasedOutputsSelector,
  RuleBasedSelectionItem
};

export const RuleBasedOutputsButtonContext = createContext<RuleBasedOutputsButtonDependencies>(
  defaultRuleBasedOutputsButtonDependencies
);
