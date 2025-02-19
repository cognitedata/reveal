/*!
 * Copyright 2025 Cognite AS
 */

import { describe, expect, test, beforeAll } from 'vitest';
import { DomainObject } from '../domainObjects/DomainObject';
import { type TranslationInput } from '../utilities/TranslateInput';
import { canCreateThreeView, createThreeView, installThreeView } from './ThreeViewFactory';
import { ThreeView } from './ThreeView';
import { Box3 } from 'three';

describe('ViewFactory', () => {
  beforeAll(() => {
    installThreeView(FooDomainObject, FooView);
    installThreeView(BarDomainObject, BarView);
    installThreeView(AnotherBarDomainObject, BarView);
  });

  test('should test can create view', () => {
    const fooDomainObject = new FooDomainObject();
    const barDomainObject = new BarDomainObject();

    expect(canCreateThreeView(fooDomainObject)).toBe(true);
    expect(canCreateThreeView(barDomainObject)).toBe(true);
  });

  test('should test inherit domain object can create view', () => {
    const anotherBarDomainObject = new AnotherBarDomainObject();
    expect(canCreateThreeView(anotherBarDomainObject)).toBe(true);
  });

  test('should test can not create view', () => {
    const bazDomainObject = new BazDomainObject();
    expect(canCreateThreeView(bazDomainObject)).toBe(false);
  });

  test('should test create view', () => {
    const fooDomainObject = new FooDomainObject();
    const barDomainObject = new BarDomainObject();
    expect(createThreeView(fooDomainObject)).instanceOf(FooView);
    expect(createThreeView(barDomainObject)).instanceOf(BarView);
  });

  test('should test inherit domain object create view', () => {
    const anotherBarDomainObject = new AnotherBarDomainObject();
    expect(createThreeView(anotherBarDomainObject)).instanceOf(BarView);
  });

  test('should test can not create view', () => {
    const bazDomainObject = new BazDomainObject();
    expect(createThreeView(bazDomainObject)).toBe(undefined);
  });
});

class FooDomainObject extends DomainObject {
  public override get typeName(): TranslationInput {
    return { untranslated: 'Foo' };
  }
}
class BarDomainObject extends DomainObject {
  public override get typeName(): TranslationInput {
    return { untranslated: 'Bar' };
  }
}
class AnotherBarDomainObject extends BarDomainObject {
  public override get typeName(): TranslationInput {
    return { untranslated: 'AnotherBar' };
  }
}
class BazDomainObject extends DomainObject {
  public override get typeName(): TranslationInput {
    return { untranslated: 'Baz' };
  }
}
class FooView extends ThreeView {
  protected override calculateBoundingBox(): Box3 {
    return new Box3();
  }
}

class BarView extends ThreeView {
  protected override calculateBoundingBox(): Box3 {
    return new Box3();
  }
}
