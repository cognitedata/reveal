import { Cognite3DModel, Cognite3DViewer } from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';
import React from 'react';
import { updateStyledNodes, projectModels } from 'utils/map/updateStyledNodes';

import { Popup } from './Popup';

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
    const newTreeIndex = await updateStyledNodes(viewer.current, event, model);
    setTreeIndex(newTreeIndex);
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
