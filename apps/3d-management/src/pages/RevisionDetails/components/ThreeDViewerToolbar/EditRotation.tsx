import React, { useState } from 'react';
import { v3 } from '@cognite/cdf-sdk-singleton';
import ButtonAnt from 'antd/lib/button';
import { Icon, Radio } from 'antd';
import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';
import { THREE } from '@cognite/reveal';

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

type RotationMenyProps = {
  onRotationChange: (rotationMatrix: THREE.Matrix4) => void;
  onEditRotationDone: (rotation: v3.Tuple3<number>) => void;
};

export function EditRotation(props: RotationMenyProps) {
  const [rotationAxis, setRotationAxis] = useState<RotationAxis>('x');
  const [rotation, setRotation] = useState<v3.Tuple3<number>>([0, 0, 0]);
  const [rotationControlsOpened, setRotationControlsOpened] = useState(false);

  const onRotateClicked = (clockwise: boolean) => {
    let newRotX = 0;
    let newRotY = 0;
    let newRotZ = 0;
    switch (rotationAxis) {
      case 'x':
        newRotX = clockwise ? 0.5 : -0.5;
        break;
      case 'y':
        newRotY = clockwise ? 0.5 : -0.5;
        break;
      default:
        newRotZ = clockwise ? 0.5 : -0.5;
        break;
    }

    setRotation([
      rotation[0] + newRotX,
      rotation[1] + newRotY,
      rotation[2] + newRotZ,
    ]);
    const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(
      new THREE.Euler(newRotX * Math.PI, newRotY * Math.PI, newRotZ * Math.PI)
    );
    props.onRotationChange(rotationMatrix);
  };

  const onPrimaryButtonClicked = () => {
    if (rotationControlsOpened) {
      setRotationControlsOpened(false);
      props.onEditRotationDone(rotation);
      setRotation([0, 0, 0]);
    } else {
      setRotationControlsOpened(true);
    }
  };

  return (
    <RotationContainer>
      <Button
        type={rotationControlsOpened ? 'primary' : 'secondary'}
        icon="Edit"
        onClick={onPrimaryButtonClicked}
      >
        {rotationControlsOpened ? 'Done editing rotation' : 'Edit rotation'}
      </Button>
      {rotationControlsOpened && (
        <>
          <ButtonGroup>
            <ButtonAnt onClick={() => onRotateClicked(false)}>
              Rotate <Icon type="undo" />
            </ButtonAnt>
            <ButtonAnt onClick={() => onRotateClicked(true)}>
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
      )}
    </RotationContainer>
  );
}
