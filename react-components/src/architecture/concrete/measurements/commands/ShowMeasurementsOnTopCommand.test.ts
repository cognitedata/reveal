import { assert, beforeEach, describe, expect, test } from 'vitest';
import { isEmpty } from '../../../base/utilities/TranslateInput';
import { type RevealRenderTarget } from '../../../base/renderTarget/RevealRenderTarget';
import { type RootDomainObject } from '../../../base/domainObjects/RootDomainObject';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import { ShowMeasurementsOnTopCommand } from './ShowMeasurementsOnTopCommand';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { MeasureBoxDomainObject } from '../MeasureBoxDomainObject';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { MeasureLineDomainObject } from '../MeasureLineDomainObject';
import { MeasureCylinderDomainObject } from '../MeasureCylinderDomainObject';
import { isInstanceOf } from '../../../base/domainObjectsHelpers/Class';
import { type CommonRenderStyle } from '../../../base/renderStyles/CommonRenderStyle';
import { count } from '../../../base/utilities/extensions/generatorUtils';

describe(ShowMeasurementsOnTopCommand.name, () => {
  let renderTarget: RevealRenderTarget;
  let root: RootDomainObject;

  beforeEach(() => {
    renderTarget = createFullRenderTargetMock();
    root = renderTarget.rootDomainObject;
  });

  test('Should have initial state', () => {
    const command = new ShowMeasurementsOnTopCommand();
    command.attach(renderTarget);

    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.icon).toBe('EyeShow');
    expect(command.buttonType).toBe('ghost');
    expect(command.isEnabled).toBe(false);
    expect(command.isToggle).toBe(true);
    expect(command.getShortCutKeys()).toBeUndefined();
  });

  test('Should set all measurements on top', () => {
    const command = new ShowMeasurementsOnTopCommand();
    command.attach(renderTarget);

    addSomeMeasurementDomainObjects(root);
    expect(count(getAllRenderStylesForAllMeasurements(root))).toBe(3);

    expect(command.isEnabled).toBe(true);
    expect(command.isChecked).toBe(false);

    for (const renderStyle of getAllRenderStylesForAllMeasurements(root)) {
      expect(renderStyle.depthTest).toBe(true);
    }
    command.invoke();
    for (const renderStyle of getAllRenderStylesForAllMeasurements(root)) {
      expect(renderStyle.depthTest).toBe(false);
    }
    expect(command.isEnabled).toBe(true);
    expect(command.isChecked).toBe(true);
  });
});

function addSomeMeasurementDomainObjects(root: DomainObject): void {
  root.addChildInteractive(new MeasureBoxDomainObject(PrimitiveType.Box));
  root.addChildInteractive(new MeasureLineDomainObject(PrimitiveType.Line));
  root.addChildInteractive(new MeasureCylinderDomainObject(PrimitiveType.Cylinder));
}

function* getAllRenderStylesForAllMeasurements(root: DomainObject): Generator<CommonRenderStyle> {
  for (const descendant of root.getDescendants()) {
    if (
      isInstanceOf(descendant, MeasureBoxDomainObject) ||
      isInstanceOf(descendant, MeasureLineDomainObject) ||
      isInstanceOf(descendant, MeasureCylinderDomainObject)
    ) {
      const style = descendant.getRenderStyle() as CommonRenderStyle;
      assert(style !== undefined, 'Render style should not be undefined');
      yield style;
    }
  }
}
