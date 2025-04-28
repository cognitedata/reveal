/*!
 * Copyright 2025 Cognite AS
 */
import { beforeEach, describe, expect, test } from 'vitest';
import { createFractalRegularGrid2 } from './geometry/createFractalRegularGrid2';
import { Range3 } from '../../base/utilities/geometry/Range3';
import { TerrainDomainObject } from './TerrainDomainObject';
import { LineSegments, Mesh, Object3D, Vector3 } from 'three';
import { TerrainThreeView } from './TerrainThreeView';
import { addView, expectChildrenOfTypeAndCount } from '#test-utils/architecture/viewUtil';
import { DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';

describe(TerrainThreeView.name, () => {
  let domainObject: TerrainDomainObject;
  let view: TerrainThreeView;

  beforeEach(() => {
    domainObject = createTerrainDomainObject();
    view = new TerrainThreeView();
    addView(domainObject, view);
  });

  test('should have object', () => {
    expect(view.object).toBeInstanceOf(Object3D);
    expectChildrenOfTypeAndCount(view, LineSegments, 1);
    expectChildrenOfTypeAndCount(view, Mesh, 1);
  });

  test('should have correct bounding box', () => {
    const range = domainObject.grid?.boundingBox;
    expect(range).toBeDefined();
    if (range === undefined) {
      return;
    }
    const boundingBoxOfGrid = range.getBox();
    boundingBoxOfGrid.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
    const boundingBoxOfView = view.boundingBox;
    expect(boundingBoxOfView).toStrictEqual(boundingBoxOfGrid);
  });

  test('should changed when toggle showContours', () => {
    const renderStyle = domainObject.renderStyle;
    expect(renderStyle).toBeDefined();
    if (renderStyle === undefined) {
      return;
    }
    renderStyle.showContours = false;
    view.update(new DomainObjectChange(Changes.renderStyle));
    expectChildrenOfTypeAndCount(view, LineSegments, 0);
    expectChildrenOfTypeAndCount(view, Mesh, 1);

    renderStyle.showContours = true;
    view.update(new DomainObjectChange(Changes.renderStyle));
    expectChildrenOfTypeAndCount(view, LineSegments, 1);
    expectChildrenOfTypeAndCount(view, Mesh, 1);
  });

  test('should changed when toggle showSolid', () => {
    const renderStyle = domainObject.renderStyle;
    expect(renderStyle).toBeDefined();
    if (renderStyle === undefined) {
      return;
    }
    renderStyle.showSolid = false;
    view.update(new DomainObjectChange(Changes.renderStyle));
    expectChildrenOfTypeAndCount(view, LineSegments, 1);
    expectChildrenOfTypeAndCount(view, Mesh, 0);

    renderStyle.showSolid = true;
    view.update(new DomainObjectChange(Changes.renderStyle));
    expectChildrenOfTypeAndCount(view, LineSegments, 1);
    expectChildrenOfTypeAndCount(view, Mesh, 1);
  });
});

export function createTerrainDomainObject(): TerrainDomainObject {
  const domainObject = new TerrainDomainObject();
  const range = new Range3(new Vector3(0, 0, 0), new Vector3(1000, 1000, 200));
  domainObject.grid = createFractalRegularGrid2(range, 4, 0.3);
  return domainObject;
}
