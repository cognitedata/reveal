import { useAuthContext, getTenantInfo } from '@cognite/react-container';
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
import * as React from 'react';

const projectModels: Record<string, AddModelOptions> = {
  'atlas-greenfield': {
    modelId: 3838447502587280,
    revisionId: 8081245322726425,
  },
};

const Map: React.FC = () => {
  const { client } = useAuthContext();
  const viewer = React.useRef<Cognite3DViewer>();
  const [treeIndex, setTI] = React.useState<number>();
  const indexes: Record<number, string> = {
    2438: 'DMVP room',
    2436: 'Cylinder',
    2445: 'Pentagon',
  };
  const [tenant] = getTenantInfo();

  React.useEffect(() => {
    const main = async () => {
      const modelInfo = projectModels[tenant];
      if (!modelInfo) {
        // eslint-disable-next-line no-console
        console.warn('Missing model info for this CDF project');
        return;
      }

      viewer.current = new Cognite3DViewer({
        // @ts-expect-error client needs updates
        sdk: client!,
        domElement: document.getElementById('reveal')!,
      });

      // load a model and add it on 3d scene
      const model = await viewer.current.addModel(modelInfo).then((model) => {
        viewer.current?.fitCameraToModel(model);
        return model as Cognite3DModel;
      });

      viewer.current.on('click', async (event) => {
        const intersection = await viewer
          .current!.getIntersectionFromPixel(event.offsetX, event.offsetY)
          .then((res) => res as CadIntersection);
        if (intersection) {
          // console.log(intersection);
          // const toPresent = {
          //   treeIndex: intersection.treeIndex,
          //   point: intersection.point,
          // };
          const myNodes = new TreeIndexNodeCollection();

          model.assignStyledNodeCollection(
            myNodes,
            DefaultNodeAppearance.Highlighted
          );
          myNodes.clear();
          myNodes.updateSet(
            new IndexSet(new NumericRange(intersection.treeIndex, 1))
          );
          setTI(intersection.treeIndex);
        }
      });
    };
    main();
  }, [client]);

  return (
    <div style={{ width: 800, height: 800 }}>
      <div id="reveal" style={{ width: '100%', height: '100%' }} />
      {treeIndex ? indexes[treeIndex] : 'Select a room'}
    </div>
  );
};

export default Map;
