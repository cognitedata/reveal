import React, { useEffect, useState } from 'react';
import { Tuple3 } from '@cognite/sdk';
import { Button as ButtonAnt, message } from 'antd';

import { Button, Dropdown, SegmentedControl } from '@cognite/cogs.js';
import styled from 'styled-components';
import {
  Cognite3DModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  THREE,
} from '@cognite/reveal';

import * as Sentry from '@sentry/browser';
import {
  Legacy3DModel,
  Legacy3DViewer,
} from 'src/pages/RevisionDetails/components/ThreeDViewer/legacyViewerTypes';
import { RedoOutlined, UndoOutlined } from '@ant-design/icons';
import antdRadioStyles from 'antd/es/radio/style/index.less';
import { useGlobalStyles } from '@cognite/cdf-utilities';

const ButtonGroup = ButtonAnt.Group;

type RotationAxis = 'x' | 'y' | 'z';

type Props = {
  saveModelRotation: (rotation: Tuple3<number>) => Promise<void>;
  viewer: Cognite3DViewer | Legacy3DViewer;
  model: Cognite3DModel | CognitePointCloudModel | Legacy3DModel;
};

export function EditRotation(props: Props) {
  useGlobalStyles([antdRadioStyles]);
  const [rotationControlsOpened, setRotationControlsOpened] = useState(false);

  return (
    <Dropdown
      visible={rotationControlsOpened}
      content={
        <EditRotationOpened
          {...props}
          onClose={() => setRotationControlsOpened(false)}
        />
      }
    >
      <Button
        type="tertiary"
        icon="Edit"
        onClick={() => setRotationControlsOpened((prevState) => !prevState)}
      >
        Edit rotation
      </Button>
    </Dropdown>
  );
}

function EditRotationOpened(props: Props & { onClose: () => void }) {
  const [rotationAxis, setRotationAxis] = useState<RotationAxis>('x');
  const [initialRotation, setInitialRotation] = useState<THREE.Matrix4>();
  const [rotationAnglePiMultiplier, setRotationAnglePiMultiplier] = useState<
    Tuple3<number>
  >([0, 0, 0]);

  const getModelTransformation = React.useCallback(() => {
    return 'getModelTransformation' in props.model
      ? props.model.getModelTransformation()
      : ((props.model.matrix.clone() as unknown) as THREE.Matrix4);
  }, [props.model]);

  const setModelTransformation = (matrix: THREE.Matrix4) => {
    if ('setModelTransformation' in props.model) {
      props.model.setModelTransformation(matrix);
    } else {
      // @ts-ignore old three
      props.model.matrix.copy(matrix);
      props.model.updateMatrixWorld(false);
    }
  };

  useEffect(() => {
    setInitialRotation(getModelTransformation());
  }, [getModelTransformation]);

  const hasChanges = rotationAnglePiMultiplier.some((r) => r);

  const onRotateClicked = (clockwise: boolean) => {
    const newRot = [0, 0, 0];
    switch (rotationAxis) {
      case 'x':
        newRot[0] = clockwise ? 0.5 : -0.5;
        break;
      case 'y':
        newRot[1] = clockwise ? 0.5 : -0.5;
        break;
      default:
        newRot[2] = clockwise ? 0.5 : -0.5;
        break;
    }

    changeModelRotation(newRot);
  };

  const changeModelRotation = (newRotationDelta: Tuple3<number>) => {
    setRotationAnglePiMultiplier(
      rotationAnglePiMultiplier.map((rot, index) => {
        const result = rot + newRotationDelta[index];
        // reset value when full rotation circle is done
        return result === 2 || result === -2 ? 0 : result;
      })
    );

    const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(
      new THREE.Euler(
        newRotationDelta[0] * Math.PI,
        newRotationDelta[1] * Math.PI,
        newRotationDelta[2] * Math.PI
      )
    );

    redrawModelWithRotation(rotationMatrix);
  };

  const redrawModelWithRotation = (rotationMatrix: THREE.Matrix4) => {
    if ('setModelTransformation' in props.model) {
      const matrix = props.model.getModelTransformation();
      const newMatrix = new THREE.Matrix4().multiplyMatrices(
        matrix,
        rotationMatrix
      );
      props.model.setModelTransformation(newMatrix);
    } else {
      const tmpMatrix = rotationMatrix.clone();

      // @ts-ignore old viewer uses old THREE with applyMatrix instead of applyMatrix4
      props.model.applyMatrix(tmpMatrix);
      props.model.updateMatrixWorld(false);
    }
    requestRedraw();
  };

  const requestRedraw = () => {
    props.viewer.fitCameraToModel(props.model as any, 0);

    if (!(props.viewer instanceof Cognite3DViewer)) {
      // This is for the _old_ 3D viewer (@cognite/3d-viewer)

      // force render hacks are required to render model correctly, otherwise some parts might not be rendered after rotation
      // @ts-ignore
      // eslint-disable-next-line
      props.viewer._forceRendering = true;
      // @ts-ignore
      // eslint-disable-next-line
      props.viewer._animate();
      requestAnimationFrame(() => {
        if (props && props.viewer) {
          // @ts-ignore
          // eslint-disable-next-line
          props.viewer._forceRendering = false;
        }
      });
    }
  };

  const onCancelClicked = () => {
    setModelTransformation(initialRotation!);

    requestRedraw();

    setRotationAnglePiMultiplier([0, 0, 0]);
    props.onClose();
  };

  const onSaveClicked = async () => {
    const [rotationX, rotationY, rotationZ] = rotationAnglePiMultiplier;

    props.onClose();

    if (rotationX || rotationY || rotationZ) {
      const progressMessage = message.loading('Uploading model rotation...');
      const rotationEuler = new THREE.Euler();
      const tmpMatrix = getModelTransformation();

      // for pointcloud it just works without that
      if (!(props.model instanceof CognitePointCloudModel)) {
        // Undo the default 90 degrees on X axis shift
        tmpMatrix.premultiply(
          new THREE.Matrix4().makeRotationFromEuler(
            new THREE.Euler(Math.PI / 2, 0, 0)
          )
        );
      }

      // Fetch actual location radians
      rotationEuler.setFromRotationMatrix(tmpMatrix);

      try {
        // Update revision with correct starting location and correct rotation
        await props.saveModelRotation(
          rotationEuler
            .toArray()
            .slice(0, 3)
            .map((n) => (n === 0 ? 1e-20 : n)) // backend bug, 0 is ignored instead of being set
        );

        progressMessage.then(() =>
          message.success('Model rotation is updated.')
        );
      } catch (e) {
        progressMessage.then(() => {
          message.error("Couldn't update model initial location");
        });
        Sentry.captureException(e);
      } finally {
        setInitialRotation(getModelTransformation());
        setRotationAnglePiMultiplier([0, 0, 0]);
      }
    }
  };

  return (
    <RotationContainer>
      <>
        <SegmentedControl
          currentKey={rotationAxis}
          fullWidth
          onButtonClicked={(newAxis) =>
            setRotationAxis(newAxis as RotationAxis)
          }
        >
          <SegmentedControl.Button key="x">X</SegmentedControl.Button>
          <SegmentedControl.Button key="y">Y</SegmentedControl.Button>
          <SegmentedControl.Button key="z">Z</SegmentedControl.Button>
        </SegmentedControl>

        <ButtonGroup style={{ marginTop: 8, marginBottom: 16 }}>
          <ButtonAnt onClick={() => onRotateClicked(true)}>
            Rotate <UndoOutlined />
          </ButtonAnt>
          <ButtonAnt onClick={() => onRotateClicked(false)}>
            Rotate <RedoOutlined />
          </ButtonAnt>
        </ButtonGroup>
      </>

      <div>
        <Button type="primary" disabled={!hasChanges} onClick={onSaveClicked}>
          Save
        </Button>

        <Button
          type="ghost"
          onClick={onCancelClicked}
          style={{ marginLeft: 8 }}
        >
          Cancel
        </Button>
      </div>
    </RotationContainer>
  );
}

const RotationContainer = styled.div`
  min-width: 236px;
  box-shadow: 0px 8px 16px 4px rgba(0, 0, 0, 0.04),
    0px 2px 12px rgba(0, 0, 0, 0.08);
  border: var(--cogs-border-default);
  padding: 12px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  && .ant-btn-group {
    display: flex;
    width: 100%;
  }

  && .ant-btn-group > * {
    flex: 1;
  }
`;
