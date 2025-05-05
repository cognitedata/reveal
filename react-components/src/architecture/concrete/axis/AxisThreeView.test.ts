/*!
 * Copyright 2024 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { AxisDomainObject } from './AxisDomainObject';
import { AxisThreeView } from './AxisThreeView';
import { createFullRenderTargetMock } from '../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { PerspectiveCamera } from 'three';

describe(AxisThreeView.name, () => {
  test('should have initial state', () => {
    const domainObject = new AxisDomainObject();

    const renderTarget = createFullRenderTargetMock();
    const root = renderTarget.rootDomainObject;

    root.addChildInteractive(domainObject);
    domainObject.setVisibleInteractive(true);

    const view = new AxisThreeView();
    view.attach(domainObject, renderTarget);
    view.initialize();
    view.onShow();
    domainObject.views.addView(view);

    const camera = new PerspectiveCamera();
    view.beforeRender(camera);

    // const view = domainObject.getViewByTarget(renderTarget) as AxisThreeView;
    expect(view.object).toBeDefined();
  });
});
