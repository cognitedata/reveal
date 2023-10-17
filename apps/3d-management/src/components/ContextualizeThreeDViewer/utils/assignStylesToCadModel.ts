import { CogniteCadModel, TreeIndexNodeCollection } from '@cognite/reveal';

import { CAD_STYLE } from '../../../pages/ContextualizeEditor/constants';

export const assignStylesToCadModel = async ({
  model,
  selectedNodeIdsStyleIndex,
  contextualizedNodesStyleIndex,
  highlightedNodeIdsStyleIndex,
}: {
  model: CogniteCadModel;
  selectedNodeIdsStyleIndex: TreeIndexNodeCollection;
  contextualizedNodesStyleIndex: TreeIndexNodeCollection;
  highlightedNodeIdsStyleIndex: TreeIndexNodeCollection;
}) => {
  model.assignStyledNodeCollection(
    selectedNodeIdsStyleIndex,
    CAD_STYLE.SELECTED
  );

  model.assignStyledNodeCollection(contextualizedNodesStyleIndex, {
    color: CAD_STYLE.CONTEXTUALIZED_COLOR,
  });

  model.assignStyledNodeCollection(
    highlightedNodeIdsStyleIndex,
    CAD_STYLE.HIGHLIGHTED
  );
};
