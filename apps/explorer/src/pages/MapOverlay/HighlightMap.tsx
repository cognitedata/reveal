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
    if (srcName && destName && model) {
      const myNodes = new TreeIndexNodeCollection();
      Promise.all([
        model?.mapNodeIdToTreeIndex(Number(srcName)),
        model?.mapNodeIdToTreeIndex(Number(destName)),
      ]).then((values) => {
        model.removeAllStyledNodeCollections();
        model.setDefaultNodeAppearance(DefaultNodeAppearance.Ghosted);

        myNodes.updateSet(new IndexSet(values));
        model.assignStyledNodeCollection(
          myNodes,
          DefaultNodeAppearance.Highlighted
        );
      });
    }
    return () => {
      model.removeAllStyledNodeCollections();
      model.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
    };
  }, [destName, srcName, modelRef]);

  return (
    <AbsoluteDisplayWrapper>
      <LinkButton to={PAGES.HOME}>Done</LinkButton>
    </AbsoluteDisplayWrapper>
  );
};
