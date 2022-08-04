import {
  DefaultNodeAppearance,
  IndexSet,
  TreeIndexNodeCollection,
} from '@cognite/reveal';
import { LinkButton } from 'components/LinkButton/LinkButton';
import { MapContext } from 'components/Map/MapProvider';
import { useGetURLSearchParams } from 'hooks/useGetURLSearchParams';
import { PAGES } from 'pages/constants';
import { useContext, useEffect } from 'react';

import { AbsoluteDisplayWrapper } from './elements';

export const HighlightMap: React.FC = () => {
  const { modelRef } = useContext(MapContext);
  const urlSearchParams = useGetURLSearchParams();
  const destName = urlSearchParams.get('to') || '';
  const srcName = urlSearchParams.get('from') || '';

  useEffect(() => {
    // this is assuming we are navingating by nodeIds. Need to refactor to pass objects in
    const model = modelRef.current;
    const oldNodeCollection = modelRef.current.styledNodeCollections;
    if (srcName && destName && model) {
      const srcNode = new TreeIndexNodeCollection();
      const destNode = new TreeIndexNodeCollection();
      Promise.all([
        model?.mapNodeIdToTreeIndex(Number(srcName)),
        model?.mapNodeIdToTreeIndex(Number(destName)),
      ]).then(([src, dest]) => {
        model.removeAllStyledNodeCollections();
        model.setDefaultNodeAppearance(DefaultNodeAppearance.Ghosted);

        srcNode.updateSet(new IndexSet([src]));
        model.assignStyledNodeCollection(srcNode, {
          renderGhosted: false,
          color: [65, 123, 219],
        });

        destNode.updateSet(new IndexSet([dest]));
        model.assignStyledNodeCollection(destNode, {
          renderGhosted: false,
          color: [115, 200, 146],
        });
      });
    }
    return () => {
      model.removeAllStyledNodeCollections();
      model.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
      oldNodeCollection.forEach((nodeCollection) => {
        if (!nodeCollection.appearance.visible) {
          model.assignStyledNodeCollection(
            nodeCollection.nodeCollection,
            nodeCollection.appearance
          );
        }
      });
    };
  }, [destName, srcName, modelRef]);

  return (
    <AbsoluteDisplayWrapper>
      <LinkButton to={PAGES.HOME}>Done</LinkButton>
    </AbsoluteDisplayWrapper>
  );
};
