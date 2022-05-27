import {
  AddModelOptions,
  CadIntersection,
  Cognite3DModel,
  Cognite3DViewer,
  DefaultNodeAppearance,
  IndexSet,
  NumericRange,
  TreeIndexNodeCollection,
} from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';
import React from 'react';

import { Popup } from './Popup';

const projectModels: Record<string, AddModelOptions> = {
  'atlas-greenfield': {
    modelId: 3838447502587280,
    revisionId: 8081245322726425,
  },
};

interface Props {
  client: CogniteClient;
  project: string;
}

const Map: React.FC<Props> = ({ client, project }) => {
  const viewer = React.useRef<Cognite3DViewer>();
  const [treeIndex, setTreeIndex] = React.useState<number>();
  const indexes: Record<number, string> = {
    2438: 'DMVP room',
    2436: 'Cylinder',
    2445: 'Pentagon',
  };

  const handleClick = async (
    event: { offsetX: any; offsetY: any },
    model: Cognite3DModel
  ) => {
    const intersection = await viewer
      .current!.getIntersectionFromPixel(event.offsetX, event.offsetY)
      .then((res) => res as CadIntersection);
    if (intersection) {
      const myNodes = new TreeIndexNodeCollection();
      const styledNodes = model.styledNodeCollections;
      // determines if we should assign highlights to nodes
      let updateStyles = true;

      if (styledNodes[0]) {
        // if there are styled nodes
        const styledIndexSet = styledNodes[0].nodeCollection.getIndexSet();
        const styledNodeTreeIndex = styledIndexSet.rootNode
          ? styledIndexSet.rootNode.range.from
          : undefined;

        // reset
        model.removeAllStyledNodeCollections();
        if (styledNodeTreeIndex === intersection.treeIndex) {
          updateStyles = false;
        }
      }

      if (updateStyles) {
        model.assignStyledNodeCollection(
          myNodes,
          DefaultNodeAppearance.Highlighted
        );
        myNodes.updateSet(
          new IndexSet(new NumericRange(intersection.treeIndex, 1))
        );
        setTreeIndex(intersection.treeIndex);
      } else {
        setTreeIndex(undefined);
      }
    } else {
      setTreeIndex(undefined);
    }
  };

  React.useEffect(() => {
    const main = async () => {
      const modelInfo = projectModels[project];
      if (!modelInfo) {
        // eslint-disable-next-line no-console
        console.warn('Missing model info for this CDF project');
        return;
      }

      viewer.current = new Cognite3DViewer({
        // @ts-expect-error client needs updates
        sdk: client,
        domElement: document.getElementById('reveal')!,
      });

      // load a model and add it on 3d scene
      const model = await viewer.current.addModel(modelInfo).then((model) => {
        viewer.current?.fitCameraToModel(model);
        return model as Cognite3DModel;
      });
      viewer.current.on('click', (event) => handleClick(event, model));
    };

    main();
  }, [client]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div id="reveal" style={{ width: '100%', height: '100%' }} />
      {treeIndex && indexes[treeIndex] ? (
        <Popup itemData={indexes[treeIndex]} />
      ) : null}
    </div>
  );
};

export default Map;
