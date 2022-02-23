import {
  Cognite3DModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  PotreePointColorType,
  THREE,
} from '@cognite/reveal';
import React from 'react';
import { Tuple3, RevisionCameraProperties } from '@cognite/sdk';
import styled from 'styled-components';
import {
  Legacy3DModel,
  Legacy3DViewer,
} from 'pages/RevisionDetails/components/ThreeDViewer/legacyViewerTypes';
import { ToolbarTreeView } from 'pages/RevisionDetails/components/ToolbarTreeView/ToolbarTreeView';
import { DEFAULT_MARGIN_H, DEFAULT_MARGIN_V, isOldViewer } from 'utils';
import { useFlag } from '@cognite/react-feature-flags';
import { isProduction } from '@cognite/cdf-utilities';
import { Switch } from '@cognite/cogs.js';
import { useUpdateRevisionMutation } from 'hooks/revisions';
import { toggleGhostMode } from 'store/modules/toolbar';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store';
import { Resizable } from 're-resizable';
import { Divider } from 'antd';
import { NodePropertyFilterIndicator } from 'pages/RevisionDetails/components/ThreeDViewerSidebar/NodePropertyFilterIndicator';
import { EditRotation } from './EditRotation';
import { ThumbnailUploader } from './ThumbnailUploader';
import { ColorTypePicker } from './ColorTypePicker';
import { ClassPicker } from './ClassPicker';

type RevisionUpdatePayload = {
  modelId: number;
  revisionId: number;
  published?: boolean;
  rotation?: Tuple3<number>;
  camera?: RevisionCameraProperties;
};

type Props = {
  // consider context for viewer/model
  viewer: Cognite3DViewer | Legacy3DViewer;
  model: Cognite3DModel | CognitePointCloudModel | Legacy3DModel;
};

// base size is thumbnail and edit rotation btns minimum width
const SIDEBAR_SECTION_MAX_WIDTH = 313;

export default function ThreeDViewerSidebar(props: Props) {
  const ghostModeEnabled = useSelector(
    (state: RootState) => state.toolbar.ghostModeEnabled
  );
  const dispatch = useDispatch();

  React.useEffect(() => {
    (window as any).model = props.model;
    (window as any).viewer = props.viewer;
  }, [props.model, props.viewer]);

  const { mutate: updateRevisionMutation } = useUpdateRevisionMutation();

  const treeViewFeatureFlagIsEnabled =
    useFlag('3DM_tree-view') || !isProduction();

  const updateInitialLocation = async (
    otherUpdates?: Partial<RevisionUpdatePayload>
  ) => {
    const { viewer } = props;

    let position: THREE.Vector3;
    let target: THREE.Vector3;

    if (viewer instanceof Cognite3DViewer) {
      const state = viewer.cameraManager.getCameraState();
      position = state.position;
      target = state.target;
    } else {
      const legacyPosition = viewer.getCameraPosition();
      position = new THREE.Vector3(
        legacyPosition.x,
        legacyPosition.y,
        legacyPosition.z
      );
      const legacyTarget = viewer.getCameraTarget();
      target = new THREE.Vector3(
        legacyTarget.x,
        legacyTarget.y,
        legacyTarget.z
      );
    }

    // Get camera position and target for upload

    // Convert camera position and target to model space
    const inverseModelMatrix = new THREE.Matrix4();
    if (props.model instanceof Cognite3DModel) {
      props.model.mapPositionFromModelToCdfCoordinates(position, position);
      props.model.mapPositionFromModelToCdfCoordinates(target, target);
    } else {
      // Get inverse transformation matrix to compute camera position and target in model space
      inverseModelMatrix.copy(props.model.matrix as any).invert();
      position.applyMatrix4(inverseModelMatrix as any);
      target.applyMatrix4(inverseModelMatrix as any);
    }

    await updateRevisionMutation({
      modelId: props.model.modelId,
      revisionId: props.model.revisionId,
      camera: {
        position: position.toArray(),
        target: target.toArray(),
      },
      ...otherUpdates,
    });
  };

  const showTreeView =
    treeViewFeatureFlagIsEnabled &&
    !(props.model instanceof CognitePointCloudModel) &&
    !isOldViewer(props.viewer);

  return (
    <SidebarContainer
      resizable={showTreeView}
      defaultWidth={showTreeView ? 400 : SIDEBAR_SECTION_MAX_WIDTH}
    >
      <MenuSection>
        <ThumbnailUploader
          style={{ marginRight: DEFAULT_MARGIN_H }}
          onUploadDone={updateInitialLocation}
          viewer={props.viewer}
          model={props.model}
        />

        <EditRotation
          saveModelRotation={(rotation) => updateInitialLocation({ rotation })}
          viewer={props.viewer}
          model={props.model}
        />
      </MenuSection>

      {props.model instanceof CognitePointCloudModel && (
        <>
          <MenuSection>
            <ColorTypePicker
              onChange={(colorType: PotreePointColorType) => {
                if (props.model instanceof CognitePointCloudModel) {
                  // eslint-disable-next-line no-param-reassign
                  props.model.pointColorType = colorType;
                }
              }}
            />
          </MenuSection>

          <MenuSection>
            <ClassPicker
              model={props.model}
              viewer={props.viewer as Cognite3DViewer}
            />
          </MenuSection>
        </>
      )}

      {showTreeView && (
        <>
          <MenuSection style={{ display: 'flex', flexWrap: 'nowrap' }}>
            <Switch
              style={{ flexShrink: 0 }}
              name="ghostMode"
              size="small"
              onChange={(nextState) => dispatch(toggleGhostMode(nextState))}
              value={ghostModeEnabled}
            >
              Ghost mode
            </Switch>

            <NodePropertyFilterIndicatorContainer>
              <NodePropertyFilterIndicator style={{ width: '100%' }} />
            </NodePropertyFilterIndicatorContainer>
          </MenuSection>

          <Divider style={{ margin: `${DEFAULT_MARGIN_V}px 0` }} />

          <ToolbarTreeView
            model={props.model as Cognite3DModel}
            viewer={props.viewer as Cognite3DViewer}
          />
        </>
      )}
    </SidebarContainer>
  );
}

function SidebarContainer({
  resizable = false,
  defaultWidth = 400,
  ...props
}: any) {
  // minWidth have to include paddings and borders
  const minWidth = SIDEBAR_SECTION_MAX_WIDTH + 16 + 2 + 1;

  const minHeight = '100%';
  const [width, setWidth] = React.useState(defaultWidth);

  return (
    <ResizableStyled
      boundsByDirection
      enable={{
        top: false,
        right: false,
        bottom: false,
        left: resizable,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      minWidth={minWidth}
      maxWidth="80%"
      minHeight={minHeight}
      size={{ width, height: minHeight }}
      onResizeStop={(e, direction, ref, d) => {
        setWidth(width + d.width);
      }}
      {...props}
    />
  );
}

const MenuSection = styled.div`
  /* select all, but not first of that class. Used because not(:first-child) */
  /* won't play well with insertion of resizable overlay into parent container */
  & ~ & {
    margin-top: ${DEFAULT_MARGIN_V}px;
  }
  width: ${SIDEBAR_SECTION_MAX_WIDTH}px;
  text-align: left;
`;

const ResizableStyled = styled(Resizable)`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 8px;
  background-color: #fff;
  overflow: hidden;
  border: 1px solid var(--cogs-border-default);
  border-left-width: 2px;
`;

const NodePropertyFilterIndicatorContainer = styled.div`
  margin-left: ${DEFAULT_MARGIN_H}px;
  flex-shrink: 1;
  flex-grow: 1;
  width: 0;
  height: 0;
`;
