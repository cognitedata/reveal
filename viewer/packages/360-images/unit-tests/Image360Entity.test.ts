/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';

import { Image360Provider } from '@reveal/data-providers';
import { Image360Entity } from '../src/entity/Image360Entity';
import { It, Mock } from 'moq.ts';
import { Overlay3DIcon } from '@reveal/3d-overlays';
import { DeviceDescriptor, SceneHandler } from '@reveal/utilities';
import { Historical360ImageSet } from '@reveal/data-providers/src/types';
import { Image360AnnotationFilter } from '../src/annotation/Image360AnnotationFilter';

function createMockImage360(options?: { customTranslation?: THREE.Matrix4 }) {
  const image360Descriptor: Historical360ImageSet = {
    id: '0',
    label: 'testEntity',
    collectionId: '0',
    collectionLabel: 'test_collection',
    transform: new THREE.Matrix4(),
    imageRevisions: [
      {
        timestamp: undefined,
        faceDescriptors: []
      }
    ]
  };

  const mockSceneHandler = new Mock<SceneHandler>().setup(p => p.addCustomObject(It.IsAny())).returns();
  const mock360ImageProvider = new Mock<Image360Provider<any>>();
  const mock360ImageIcon = new Overlay3DIcon({ position: new THREE.Vector3(),
                                               minPixelSize: 10,
                                               maxPixelSize: 10,
                                               iconRadius: 10 }, {});// new Mock<Overlay3DIcon>().object();

  const testTranslation = options?.customTranslation ?? new THREE.Matrix4();
  const desktopDevice: DeviceDescriptor = { deviceType: 'desktop' };

  return new Image360Entity(
    image360Descriptor,
    mockSceneHandler.object(),
    mock360ImageProvider.object(),
    new Image360AnnotationFilter({}),
    testTranslation,
    mock360ImageIcon,
    desktopDevice
  );
}

describe(Image360Entity.name, () => {
  test('transformation should be respected', () => {
    const testTranslation = new THREE.Matrix4().makeTranslation(4, 5, 6);
    const entity = createMockImage360({ customTranslation: testTranslation });

    expect(entity.transform.equals(testTranslation)).toBeTrue();
  });

  test('set icon color is returned in getter', () => {
    const entity = createMockImage360();

    const { color: originalColor } = entity.getIconStyle();

    expect(originalColor).toBe(undefined);

    const testColor = new THREE.Color(0.2, 0.3, 0.4);
    entity.setIconStyle({ color: testColor });

    const { color: gottenColor } = entity.getIconStyle();

    expect(gottenColor?.toArray()).toEqual(testColor.toArray());
  });

  test('setting undefined icon color resets image360 icon color', () => {
    const entity = createMockImage360();

    const testColor = new THREE.Color(0.2, 0.3, 0.4);
    entity.setIconStyle({ color: testColor });

    const { color: firstColor } = entity.getIconStyle();

    expect(firstColor).not.toBe(undefined);

    entity.setIconStyle({ color: undefined });

    const { color: secondColor } = entity.getIconStyle();

    expect(secondColor).toBe(undefined);
  });
});
