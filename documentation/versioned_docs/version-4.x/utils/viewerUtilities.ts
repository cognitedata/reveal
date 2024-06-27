import {
  CogniteCadModel,
  DefaultNodeAppearance,
} from '@cognite/reveal';


/**
 * Resets state of model to the default state (i.e. appearance and styled sets)
 * @param model
 */
export function resetCogniteCadModel(model: CogniteCadModel): void {
  model.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
  model.removeAllStyledNodeCollections();
}
