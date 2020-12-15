import {
  Cognite3DModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  PotreePointColorType,
} from '@cognite/reveal';
import React from 'react';
import * as THREE from 'three';
import { v3 } from '@cognite/cdf-sdk-singleton';
import styled from 'styled-components';
import {
  Legacy3DModel,
  Legacy3DViewer,
} from 'src/pages/RevisionDetails/components/ThreeDViewer/legacyViewerTypes';
import { ToolbarTreeView } from 'src/pages/RevisionDetails/components/ToolbarTreeView/ToolbarTreeView';
import { DEFAULT_MARGIN_H, DEFAULT_MARGIN_V, isOldViewer } from 'src/utils';
import { useFlag } from '@cognite/react-feature-flags';
import { isProduction } from '@cognite/cdf-utilities';
import { Button, Switch } from '@cognite/cogs.js';
import { useUpdateRevisionMutation } from 'src/hooks/revisions';
import { toggleGhostMode } from 'src/store/modules/toolbar';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store';
import { EditRotation } from './EditRotation';
import { ThumbnailUploader } from './ThumbnailUploader';
import { ColorTypePicker } from './ColorTypePicker';
import { ClassPicker } from './ClassPicker';

const CONTAINER_PADDING = 8;
const CONTAINER_WIDTH = 400;
const SCROLLBAR_WIDTH = 2;

const MenuSection = styled.div`
  &:not(:first-child) {
    margin-top: ${DEFAULT_MARGIN_V}px;
  }
  width: fit-content;
`;

const ToolbarStyled = styled.div`
  height: 100%;
  width: ${CONTAINER_WIDTH}px;
  display: flex;
  flex-direction: column;
  padding: ${CONTAINER_PADDING}px;
  background-color: #fff;
  border: 1px solid var(--cogs-greyscale-grey3);
  overflow: hidden;
`;

type RevisionUpdatePayload = {
  modelId: number;
  revisionId: number;
  published?: boolean;
  rotation?: v3.Tuple3<number>;
  camera?: v3.RevisionCameraProperties;
};

type Props = {
  // consider context for viewer/model
  viewer: Cognite3DViewer | Legacy3DViewer;
  model: Cognite3DModel | CognitePointCloudModel | Legacy3DModel;
  revision: v3.Revision3D;
};

export default function ThreeDViewerToolbar(props: Props) {
  const ghostModeEnabled = useSelector(
    (state: RootState) => state.toolbar.ghostModeEnabled
  );
  const dispatch = useDispatch();

  React.useEffect(() => {
    (window as any).model = props.model;
    (window as any).viewer = props.viewer;
  }, [props.model, props.viewer]);

  const [updateRevisionMutation] = useUpdateRevisionMutation();

  const treeViewIsHiddenByFeatureFlag =
    useFlag('3DM_tree_view_hidden') && isProduction();

  const updateInitialLocation = async (
    otherUpdates?: Partial<RevisionUpdatePayload>
  ) => {
    // Get camera position and target for upload
    const position = props.viewer.getCameraPosition();
    const target = props.viewer.getCameraTarget();

    // Convert camera position and target to model space
    const inverseModelMatrix = new THREE.Matrix4();
    if (props.model instanceof Cognite3DModel) {
      props.model.mapPositionFromModelToCdfCoordinates(position, position);
      props.model.mapPositionFromModelToCdfCoordinates(target, target);
    } else {
      // Get inverse transformation matrix to compute camera position and target in model space
      inverseModelMatrix.getInverse(props.model.matrix);
      position.applyMatrix4(inverseModelMatrix);
      target.applyMatrix4(inverseModelMatrix);
    }

    await updateRevisionMutation({
      modelId: props.model.modelId,
      revisionId: props.model.revisionId,
      camera: {
        position: position.toArray(),
        target: target.toArray(),
      },
      ...(otherUpdates as any), // fixme: bad types in sdk for rotation - should be Tuple everywhere
    });
  };

  const showTreeView =
    !treeViewIsHiddenByFeatureFlag &&
    !(props.model instanceof CognitePointCloudModel) &&
    !isOldViewer(props.viewer);

  return (
    <ToolbarStyled>
      <MenuSection>
        <ThumbnailUploader
          onUploadDone={updateInitialLocation}
          getScreenshot={(w, h) => props.viewer.getScreenshot(w, h)}
          modelId={props.model.modelId}
          revisionId={props.model.revisionId}
        />

        <Button
          style={{ marginLeft: DEFAULT_MARGIN_H }}
          icon="Scan"
          onClick={() => props.viewer.fitCameraToModel(props.model as any, 400)}
        >
          Camera to model
        </Button>
      </MenuSection>

      <MenuSection>
        <EditRotation
          saveModelRotation={(rotation) => updateInitialLocation({ rotation })}
          viewer={props.viewer}
          model={props.model}
          revision={props.revision}
        />
      </MenuSection>

      {props.model instanceof CognitePointCloudModel && (
        <MenuSection style={{ display: 'flex', width: '100%' }}>
          <ColorTypePicker
            onChange={(colorType: PotreePointColorType) => {
              if (props.model instanceof CognitePointCloudModel) {
                // eslint-disable-next-line no-param-reassign
                props.model.pointColorType = colorType;
              }
            }}
          />

          <div style={{ marginLeft: DEFAULT_MARGIN_H, flexGrow: 1 }}>
            <ClassPicker model={props.model} />
          </div>
        </MenuSection>
      )}

      {showTreeView && (
        <>
          <MenuSection>
            <Switch
              name="ghostMode"
              size="small"
              onChange={(nextState) => dispatch(toggleGhostMode(nextState))}
              value={ghostModeEnabled}
            >
              Ghost mode
            </Switch>
          </MenuSection>
          <div
            style={{
              marginTop: DEFAULT_MARGIN_V,
            }}
          >
            <hr />
          </div>
          <ToolbarTreeView
            style={{
              marginTop: DEFAULT_MARGIN_V,
            }}
            width={CONTAINER_WIDTH - 2 * CONTAINER_PADDING - SCROLLBAR_WIDTH}
            model={props.model as Cognite3DModel}
            viewer={props.viewer as Cognite3DViewer}
          />
        </>
      )}
    </ToolbarStyled>
  );
}
