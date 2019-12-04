/*!
 * Copyright 2019 Cognite AS
 */

import * as Cesium from 'cesium';
import initializeCesiumSectorScene from '../../views/cesiumjs/createCesiumSectorNode';
import { createLocalSectorModel } from '../..';

async function main() {
  // TODO 2019-11-08 larsmoa: @types/cesium is lacking some of the supported options, so we need
  // to use 'any'.
  const options: any = {
    useBrowserRecommendedResolution: true,
    scene3DOnly: true
  };
  const viewer = new Cesium.Viewer('cesiumContainer', options);
  viewer.extend(Cesium.viewerCesiumInspectorMixin, {});

  const sectorModel = createLocalSectorModel('/transformer');
  const cogniteOffice = Cesium.Cartesian3.fromDegrees(10.624603, 59.904081);
  const modelOffset = new Cesium.Cartesian3(0.0, 0.0, 0.0);
  const [bounds, modelTransformation] = await initializeCesiumSectorScene(
    cogniteOffice,
    modelOffset,
    sectorModel,
    viewer.scene
  );

  // const axes = new Cesium.DebugModelMatrixPrimitive({
  //   length: 1000,
  //   width: 10,
  //   modelMatrix: toCesiumMatrix4(modelTransformation.modelMatrix)
  // });
  // viewer.scene.primitives.add(axes);

  bounds.radius *= 1.67;
  viewer.camera.flyToBoundingSphere(bounds);

  const center = bounds.center;
  center.z += 60;
  const heading = Cesium.Math.toRadians(50.0);
  const pitch = Cesium.Math.toRadians(-20.0);
  const range = 50.0;
  viewer.camera.lookAt(center, new Cesium.HeadingPitchRange(heading, pitch, range));
}

main();
