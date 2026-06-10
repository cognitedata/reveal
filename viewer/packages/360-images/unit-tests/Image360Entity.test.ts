/*!
 * Copyright 2022 Cognite AS
 */

import { Color, Matrix4, Vector3 } from 'three';

import type { ClassicDataSourceType, Image360Provider } from '@reveal/data-providers';
import { Image360Entity } from '../src/entity/Image360Entity';
import { It, Mock } from 'moq.ts';
import { Overlay3DIcon } from '@reveal/3d-overlays';
import type { DeviceDescriptor, SceneHandler } from '@reveal/utilities';
import type { Historical360ImageSet } from '@reveal/data-providers/src/types';
import { Image360AnnotationFilter } from '../src/annotation/Image360AnnotationFilter';

function createMockImage360(options?: { customTranslation?: Matrix4 }) {
  const image360Descriptor: Historical360ImageSet<ClassicDataSourceType> = {
    id: '0',
    label: 'testEntity',
    collectionId: '0',
    collectionLabel: 'test_collection',
    transform: new Matrix4(),
    imageRevisions: [
      {
        id: '1',
        timestamp: undefined,
        faceDescriptors: []
      }
    ]
  };

  const mockSceneHandler = new Mock<SceneHandler>().setup(p => p.addObject3D(It.IsAny())).returns();
  const mock360ImageProvider = new Mock<Image360Provider<any>>();
  const mock360ImageIcon = new Overlay3DIcon(
    { position: new Vector3(), minPixelSize: 10, maxPixelSize: 10, iconRadius: 10 },
    {}
  );

  const testTranslation = options?.customTranslation ?? new Matrix4();
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
    const testTranslation = new Matrix4().makeTranslation(4, 5, 6);
    const entity = createMockImage360({ customTranslation: testTranslation });

    expect(entity.transform.equals(testTranslation)).toBeTruthy();
  });

  test('set icon color is returned in getter', () => {
    const entity = createMockImage360();

    const originalColor = entity.getIconColor();

    expect(originalColor).toBe('default');

    const testColor = new Color(0.2, 0.3, 0.4);
    entity.setIconColor(testColor);

    const gottenColor = entity.getIconColor();

    expect(gottenColor).not.toBe('default');
    expect((gottenColor as Color).toArray()).toEqual(testColor.toArray());
  });

  test('setting undefined icon color resets image360 icon color', () => {
    const entity = createMockImage360();

    const testColor = new Color(0.2, 0.3, 0.4);
    entity.setIconColor(testColor);

    const firstColor = entity.getIconColor();

    expect(firstColor).not.toBe('default');

    entity.setIconColor('default');
    const secondColor = entity.getIconColor();

    expect(secondColor).toBe('default');
  });
});
