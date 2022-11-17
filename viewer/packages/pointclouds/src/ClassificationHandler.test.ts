/*!
 * Copyright 2022 Cognite AS
 */

import { ClassificationHandler } from './ClassificationHandler';

import { Mock } from 'moq.ts';
import { DEFAULT_CLASSIFICATION, PointCloudMaterial } from '@reveal/rendering';
import { WellKnownAsprsPointClassCodes } from './types';

describe(ClassificationHandler.name, () => {
  let material: PointCloudMaterial;

  const classificationSet = [
    {
      name: 'class 1',
      code: 1
    },
    {
      name: 'class 2',
      code: 2
    }
  ];

  const classificationInfo = {
    classificationSets: [{ name: 'default', classificationSet }]
  };

  beforeAll(() => {
    material = new Mock<PointCloudMaterial>()
      .setup(p => p.classification)
      .returns(DEFAULT_CLASSIFICATION)
      .object();
  });

  test('holds all default classes on construction', () => {
    const handler = new ClassificationHandler(material, { classificationSets: [] });
    const classNames = handler.classes.map(c => c.name);

    const defaultClasses = Object.keys(DEFAULT_CLASSIFICATION)
      .map(k => (isNaN(parseInt(k)) ? -1 : parseInt(k)))
      .map(k => WellKnownAsprsPointClassCodes[k]);

    expect(classNames).toHaveLength(defaultClasses.length);
    expect(classNames).toContainValues(defaultClasses);
  });

  test('holds provided classification set if any', () => {
    const handler = new ClassificationHandler(material, classificationInfo);

    const resultClasses = handler.classes;

    expect(resultClasses).toHaveLength(classificationSet.length);
    expect(resultClasses.map(c => c.name)).toContainValues(classificationSet.map(c => c.name));
    expect(resultClasses.map(c => c.code)).toContainValues(classificationSet.map(c => c.code));
  });

  test('has classes in custom classification set', () => {
    const handler = new ClassificationHandler(material, classificationInfo);

    expect(handler.hasClass(1)).toBeTrue();
    expect(handler.hasClass(2)).toBeTrue();
    expect(handler.hasClass(3)).toBeFalse();
  });

  test('reports all classes as visible by default', () => {
    const handler = new ClassificationHandler(material, { classificationSets: [] });

    for (const cl of handler.classes) {
      expect(handler.isClassVisible(cl.code)).toBeTrue();
    }
  });
});
