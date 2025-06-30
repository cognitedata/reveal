import { assertType, describe, expect, test } from 'vitest';
import { isRevealDomainObject, type RevealDomainObject } from './typeGuards';
import { CadDomainObject } from '../cad/CadDomainObject';
import { PointCloudDomainObject } from '../pointCloud/PointCloudDomainObject';
import { createCadMock } from '#test-utils/fixtures/cadModel';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';
import { Image360CollectionDomainObject } from '../Image360Collection/Image360CollectionDomainObject';
import { createImage360ClassicMock } from '#test-utils/fixtures/image360';
import assert from 'assert';
import { DomainObject } from '../../../base/domainObjects/DomainObject';

describe('Architecture Reveal type guards', () => {
  describe(isRevealDomainObject.name, () => {
    test('recognizes all three Reveal domain objects', () => {
      const cadDomainObject = new CadDomainObject(createCadMock());
      const pointCloudDomainObject = new PointCloudDomainObject(createPointCloudMock());
      const image360CollectionDomainObject = new Image360CollectionDomainObject(
        createImage360ClassicMock()
      );

      expect(isRevealDomainObject(cadDomainObject)).toBeTruthy();
      expect(isRevealDomainObject(pointCloudDomainObject)).toBeTruthy();
      expect(isRevealDomainObject(image360CollectionDomainObject)).toBeTruthy();
    });

    test('should not recognize other objects', () => {
      const domainObject0 = new DerivedDomainObject();

      expect(isRevealDomainObject(domainObject0)).toBeFalsy();
    });

    test('narrows type of object', () => {
      const domainObject: DomainObject = new CadDomainObject(createCadMock());

      assert(isRevealDomainObject(domainObject));

      assertType<RevealDomainObject>(domainObject);
    });
  });
});

class DerivedDomainObject extends DomainObject {
  typeName = { untranslated: 'DerivedDomainObject' };
}
