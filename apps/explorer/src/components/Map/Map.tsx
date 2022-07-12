import {
  AddModelOptions,
  Cognite3DModel,
  Cognite3DViewer,
} from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';
import React from 'react';
import { updateStyledNodes } from 'utils/map/updateStyledNodes';

const fullStyle = { width: '100%', height: '100%' };

interface Props {
  client: CogniteClient;
  model: AddModelOptions;
  setNodeIdInUrl: (treeNodeId: number | undefined) => void;
}

const Map: React.FC<Props> = ({ client, model, setNodeIdInUrl }) => {
  const viewer = React.useRef<Cognite3DViewer>();
  // Need to work on connecting this with nodeId
  const [_treeIndex, setTreeIndex] = React.useState<number>();

  const handleClick = async (
    event: { offsetX: any; offsetY: any },
    model: Cognite3DModel
  ) => {
    const { newTreeIndex, newTreeNodeId } = await updateStyledNodes(
      viewer.current,
      event,
      model
    );

    setNodeIdInUrl(newTreeNodeId);
    setTreeIndex(newTreeIndex);
  };

  React.useEffect(() => {
    const main = async () => {
      viewer.current = new Cognite3DViewer({
        // @ts-expect-error client needs updates
        sdk: client,
        domElement: document.getElementById('reveal-map')!,
      });

      // load a model and add it on 3d scene
      const loadedModel = await viewer.current.addModel(model).then((model) => {
        viewer.current?.fitCameraToModel(model);
        return model as Cognite3DModel;
      });
      viewer.current.on('click', (event) => handleClick(event, loadedModel));
    };

    main();
  }, []);

  return (
    <div style={fullStyle}>
      <div id="reveal-map" style={fullStyle} />
    </div>
  );
};

export default Map;
