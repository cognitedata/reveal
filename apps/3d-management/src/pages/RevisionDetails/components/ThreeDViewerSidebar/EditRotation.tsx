import React, { useEffect, useState } from 'react';
import { Tuple3 } from '@cognite/sdk';
import { Button as ButtonAnt, message } from 'antd';

import { Button, Dropdown, SegmentedControl, Menu } from '@cognite/cogs.js';
import {
  CogniteCadModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  CDF_TO_VIEWER_TRANSFORMATION,
} from '@cognite/reveal';

import * as Sentry from '@sentry/browser';
import { RedoOutlined, UndoOutlined } from '@ant-design/icons';
import antdRadioStyles from 'antd/es/radio/style/index.less';
import { useGlobalStyles } from '@cognite/cdf-utilities';

import * as THREE from 'three';

const ButtonGroup = ButtonAnt.Group;

type RotationAxis = 'x' | 'y' | 'z';

type Props = {
  saveModelRotation: (rotation: Tuple3<number>) => Promise<void>;
  viewer: Cognite3DViewer;
  model: CogniteCadModel | CognitePointCloudModel;
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
  const [cdfTransformWithoutRotation, setCdfTransformWithoutRotation] =
    useState<THREE.Matrix4>();
  const [invCdfTransformWithRotation, setInvCdfTransformWithRotation] =
    useState<THREE.Matrix4>();
  const [initialPiMultiplier, setInitialPiMultiplier] = useState<
    Tuple3<number>
  >([0, 0, 0]);
  const [rotationAnglePiMultiplier, setRotationAnglePiMultiplier] = useState<
    Tuple3<number>
  >([0, 0, 0]);

  useEffect(() => {
    const defaultTransformWithCdfMatrix =
      props.model.getCdfToDefaultModelTransformation();

    setDefaultCdfTransformationUtils(defaultTransformWithCdfMatrix);

    const customTransform = props.model.getModelTransformation();
    const customTransformInCdfSpace = CDF_TO_VIEWER_TRANSFORMATION.clone()
      .transpose()
      .multiply(customTransform)
      .multiply(CDF_TO_VIEWER_TRANSFORMATION);
    const defaultTransformationMatrix = new THREE.Matrix4().multiplyMatrices(
      CDF_TO_VIEWER_TRANSFORMATION.clone().transpose(), // Inverted of rotation matrix is transponed
      defaultTransformWithCdfMatrix
    );

    const startTransformInCdfSpace = customTransformInCdfSpace
      .clone()
      .multiply(defaultTransformationMatrix);

    const initialRotation = new THREE.Matrix4().extractRotation(
      startTransformInCdfSpace
    );
    const euler = new THREE.Euler().setFromRotationMatrix(initialRotation);
    const eulerComponents = [euler.x, euler.y, euler.z];
    const eulerPiMultipliers = eulerComponents.map((a) => a / Math.PI);

    setInitialPiMultiplier([...eulerPiMultipliers]);
    setRotationAnglePiMultiplier([...eulerPiMultipliers]);
  }, [props.model, props.model.modelId, props.model.revisionId]);

  // When computing the new transformation of the model in view, we must take
  // the default CDF transformation into account. Since it is always applied
  // before the custom matrix, it must be multiplied away, and multiplied back in
  // again when setting the rotation as a custom transform, as to simulate it
  // as a CDF-stored transform. This function computes and sets the two matrices
  // used for this back-and-forth conversion
  const setDefaultCdfTransformationUtils = (
    cdfDefaultMatrix: THREE.Matrix4
  ) => {
    const cdfRotation = new THREE.Matrix4().extractRotation(
      CDF_TO_VIEWER_TRANSFORMATION.clone()
        .transpose()
        .multiply(cdfDefaultMatrix)
    );

    const invCdfTransform = cdfDefaultMatrix.clone().invert();

    setInvCdfTransformWithRotation(invCdfTransform.clone());
    setCdfTransformWithoutRotation(
      cdfDefaultMatrix.clone().multiply(cdfRotation.clone().transpose())
    );
  };

  const hasChanges = rotationAnglePiMultiplier.some((r, ind) => {
    const diff = Math.abs(r - initialPiMultiplier![ind]);
    const modDiff = Math.min(diff, 2 - diff);
    return modDiff > 1e-2;
  });

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
    const newPiMultiplier = rotationAnglePiMultiplier.map((rot, index) => {
      const result = rot + newRotationDelta[index];
      const wrappedResult = result % 2;
      // reset value when full rotation circle is done
      return wrappedResult;
    });

    setRotationAnglePiMultiplier(newPiMultiplier);

    redrawModelWithTransformation(
      computeCustomTransformationFromPiMultipliers(newPiMultiplier)
    );
  };

  const redrawModelWithTransformation = (customMatrix: THREE.Matrix4) => {
    props.model.setModelTransformation(customMatrix);
    // TODO 2022-09-23 larsmoa: Necessary because of https://cognitedata.atlassian.net/browse/REV-521
    props.viewer.requestRedraw();
  };

  const computeCustomTransformationFromPiMultipliers = (
    piMultipliers: Tuple3<number>
  ) => {
    const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(
      new THREE.Euler(
        piMultipliers[0] * Math.PI,
        piMultipliers[1] * Math.PI,
        piMultipliers[2] * Math.PI
      )
    );

    return cdfTransformWithoutRotation!
      .clone()
      .multiply(rotationMatrix)
      .multiply(invCdfTransformWithRotation!);
  };

  const onCancelClicked = () => {
    const customMatrix =
      computeCustomTransformationFromPiMultipliers(initialPiMultiplier);
    redrawModelWithTransformation(customMatrix);

    if (!rotationAnglePiMultiplier.every((c) => c === 0)) {
      props.viewer.fitCameraToModel(props.model, 0);
    }

    setRotationAnglePiMultiplier(initialPiMultiplier!);
    props.onClose();
  };

  const onSaveClicked = async () => {
    const [rotationX, rotationY, rotationZ] = rotationAnglePiMultiplier;

    props.onClose();

    if (rotationX || rotationY || rotationZ) {
      const progressMessage = message.loading('Uploading model rotation...');
      const rotationEuler = new THREE.Euler();

      // Fetch actual location radians
      rotationEuler.fromArray([
        rotationX * Math.PI,
        rotationY * Math.PI,
        rotationZ * Math.PI,
      ]);

      try {
        // Update revision with correct starting location and correct rotation
        await props.saveModelRotation(
          // backend bug, 0 is ignored instead of being set
          [rotationEuler.x, rotationEuler.y, rotationEuler.z].map((n) =>
            n === 0 ? 1e-20 : n
          )
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
        setInitialPiMultiplier(rotationAnglePiMultiplier);
      }
    }
  };

  return (
    <Menu>
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
    </Menu>
  );
}
