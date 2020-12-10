import React, { useEffect, useState } from 'react';
import { v3 } from '@cognite/cdf-sdk-singleton';
import ButtonAnt from 'antd/lib/button';
import { Icon, Radio } from 'antd';
import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';
import {
  Cognite3DModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  THREE,
} from '@cognite/reveal';
import message from 'antd/lib/message';
import MessageType from 'src/AntdMessage';
import * as Sentry from '@sentry/browser';
import {
  Legacy3DModel,
  Legacy3DViewer,
} from 'src/pages/RevisionDetails/components/ThreeDViewer/legacyViewerTypes';

const ButtonGroup = ButtonAnt.Group;

const RotationContainer = styled.div`
  display: flex;
  flex-direction: column;
  && .ant-btn-group,
  && .ant-radio-group {
    display: flex;
    margin-bottom: 6px;
    width: 100%;
  }
  && .ant-btn-group > *,
  && .ant-radio-group > * {
    flex: 1;
  }
`;

type RotationAxis = 'x' | 'y' | 'z';

type Props = {
  saveModelRotation: (rotation: v3.Tuple3<number>) => void;
  viewer: Cognite3DViewer | Legacy3DViewer;
  model: Cognite3DModel | CognitePointCloudModel | Legacy3DModel;
  revision: v3.Revision3D;
};

export function EditRotation(props: Props) {
  const [rotationControlsOpened, setRotationControlsOpened] = useState(false);

  if (rotationControlsOpened) {
    return (
      <EditRotationOpened
        {...props}
        onClose={() => setRotationControlsOpened(false)}
      />
    );
  }

  return (
    <Button
      type="secondary"
      icon="Edit"
      onClick={() => setRotationControlsOpened(true)}
    >
      {rotationControlsOpened ? 'Save rotation' : 'Edit rotation'}
    </Button>
  );
}

function EditRotationOpened(props: Props & { onClose: () => void }) {
  const [rotationAxis, setRotationAxis] = useState<RotationAxis>('x');
  const [initialRotation, setInitialRotation] = useState<THREE.Matrix4>();
  const [rotationAnglePiMultiplier, setRotationAnglePiMultiplier] = useState<
    v3.Tuple3<number>
  >([0, 0, 0]);

  useEffect(() => {
    setInitialRotation(
      'getModelTransformation' in props.model
        ? props.model.getModelTransformation()
        : props.model.matrix.clone()
    );
  }, [props.model]);

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

  const changeModelRotation = (newRotationDelta: v3.Tuple3<number>) => {
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
    forceRerender();
  };

  const forceRerender = () => {
    props.viewer.fitCameraToModel(props.model as any, 0);

    if (!(props.viewer instanceof Cognite3DViewer)) {
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
    if ('setModelTransformation' in props.model) {
      props.model.setModelTransformation(initialRotation!);
    } else {
      // @ts-ignore old three
      props.model.matrix.copy(initialRotation);
      props.model.updateMatrixWorld(false);
    }

    forceRerender();

    setRotationAnglePiMultiplier([0, 0, 0]);
    props.onClose();
  };

  const onSaveClicked = async () => {
    const [rotationX, rotationY, rotationZ] = rotationAnglePiMultiplier;

    props.onClose();

    if (rotationX || rotationY || rotationZ) {
      const progressMessage = message.loading(
        'Uploading model rotation...'
      ) as MessageType;
      const rotationEuler = new THREE.Euler();
      let tmpMatrix: THREE.Matrix4;
      if ('getModelTransformation' in props.model) {
        tmpMatrix = props.model.getModelTransformation();
      } else {
        tmpMatrix = props.model.matrix.clone();
      }

      // for pointcloud it just works without that
      if (props.model instanceof Cognite3DModel) {
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
        await props.saveModelRotation(rotationEuler.toArray().slice(0, 3));

        progressMessage.then(() =>
          message.success('Model rotation is updated.')
        );
      } catch (e) {
        progressMessage.then(() => {
          message.error("Couldn't update model initial location");
        });
        Sentry.captureException(e);
      }
    }
  };

  return (
    <RotationContainer>
      <>
        <ButtonGroup>
          <ButtonAnt onClick={() => onRotateClicked(true)}>
            Rotate <Icon type="undo" />
          </ButtonAnt>
          <ButtonAnt onClick={() => onRotateClicked(false)}>
            Rotate <Icon type="redo" />
          </ButtonAnt>
        </ButtonGroup>
        <Radio.Group
          value={rotationAxis}
          buttonStyle="solid"
          onChange={(e) => setRotationAxis(e.target.value)}
        >
          <Radio.Button value="x">X</Radio.Button>
          <Radio.Button value="y">Y</Radio.Button>
          <Radio.Button value="z">Z</Radio.Button>
        </Radio.Group>
      </>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          type="secondary"
          onClick={onCancelClicked}
          style={{ marginRight: 8 }}
        >
          Cancel
        </Button>

        <Button
          type="primary"
          icon="Edit"
          disabled={!hasChanges}
          onClick={onSaveClicked}
        >
          Save rotation
        </Button>
      </div>
    </RotationContainer>
  );
}
