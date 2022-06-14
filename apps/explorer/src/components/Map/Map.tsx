import {
  AddModelOptions,
  Cognite3DModel,
  Cognite3DViewer,
} from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';
import React from 'react';
import { updateStyledNodes } from 'utils/map/updateStyledNodes';

import { Popup } from './Popup';

const fullStyle = { width: '100%', height: '100%' };

interface Props {
  client: CogniteClient;
  model: AddModelOptions;
}
const Map: React.FC<Props> = ({ client, model }) => {
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
      viewer.current = new Cognite3DViewer({
        // @ts-expect-error client needs updates
        sdk: client,
        domElement: document.getElementById('reveal')!,
      });

      // load a model and add it on 3d scene
      const loadedModel = await viewer.current.addModel(model).then((model) => {
        viewer.current?.fitCameraToModel(model);
        return model as Cognite3DModel;
      });
      viewer.current.on('click', (event) => handleClick(event, loadedModel));
    };

    main();
  }, [client]);

  return (
    <div style={fullStyle}>
      <div id="reveal-map" style={fullStyle} />
      {treeIndex && indexes[treeIndex] ? (
        <Popup itemData={indexes[treeIndex]} />
      ) : null}
    </div>
  );
};

export default Map;
