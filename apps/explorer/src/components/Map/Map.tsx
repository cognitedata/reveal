import {
  AddModelOptions,
  Cognite3DModel,
  Cognite3DViewer,
} from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';
import { MapOverlayRouter } from 'pages/MapOverlay/MapOverlayRouter';
import React, { useContext } from 'react';
import { updateStyledNodes } from 'utils/map/updateStyledNodes';

import { MapContext } from './MapProvider';

const fullStyle = { width: '100%', height: '100%' };

interface Props {
  client: CogniteClient;
  modelOptions: AddModelOptions;
  setNodeIdInUrl: (treeNodeId: number | undefined) => void;
}

const Map: React.FC<Props> = ({ client, modelOptions, setNodeIdInUrl }) => {
  const { viewerRef, modelRef } = useContext(MapContext);
  const handleClick = async (
    event: { offsetX: any; offsetY: any },
    model: Cognite3DModel
  ) => {
    const { newTreeNodeId } = await updateStyledNodes(
      viewerRef.current,
      event,
      model
    );

    setNodeIdInUrl(newTreeNodeId);
  };

  React.useEffect(() => {
    const main = async () => {
      viewerRef.current = new Cognite3DViewer({
        // @ts-expect-error client needs updates
        sdk: client,
        domElement: document.getElementById('reveal-map')!,
      });

      // load a model and add it on 3d scene
      modelRef.current = await viewerRef.current
        .addModel(modelOptions)
        .then((fetchedModel) => {
          viewerRef.current?.fitCameraToModel(fetchedModel);
          return fetchedModel as Cognite3DModel;
        });

      const newControlsOptions = {
        mouseWheelAction: 'zoomToCursor',
        changeCameraTargetOnClick: false,
      };

      // @ts-expect-error property does not exist due to out of date client
      viewerRef.current.cameraManager.setCameraControlsOptions(
        newControlsOptions
      );

      viewerRef.current.on('click', (event) =>
        handleClick(event, modelRef.current as Cognite3DModel)
      );
    };
    main();
  }, []);

  return (
    <div style={fullStyle}>
      <MapOverlayRouter />
      <div id="reveal-map" style={fullStyle} />
    </div>
  );
};

export default Map;
