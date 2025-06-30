import { describe, expect, test } from 'vitest';
import { getRevealDomainObjects } from './getRevealDomainObjects';
import { CadDomainObject } from '../cad/CadDomainObject';
import { createCadMock } from '#test-utils/fixtures/cadModel';
import { PointCloudDomainObject } from '../pointCloud/PointCloudDomainObject';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';
import { Image360CollectionDomainObject } from '../Image360Collection/Image360CollectionDomainObject';
import { createImage360ClassicMock } from '#test-utils/fixtures/image360';
import { DomainObject } from '../../../base/domainObjects/DomainObject';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';

describe(getRevealDomainObjects.name, () => {
  test('gets all added Reveal domainobjects, and nothing else', () => {
    const revealRenderTarget = createRenderTargetMock();

    const derivedDomainObject = new DummyDomainObject();
    const cadDomainObject = new CadDomainObject(createCadMock());
    const pointCloudDomainObject = new PointCloudDomainObject(createPointCloudMock());
    const image360DomainObject = new Image360CollectionDomainObject(createImage360ClassicMock());

    revealRenderTarget.rootDomainObject.addChild(cadDomainObject);
    revealRenderTarget.rootDomainObject.addChild(derivedDomainObject);
    derivedDomainObject.addChild(pointCloudDomainObject);
    derivedDomainObject.addChild(image360DomainObject);

    const results = [...getRevealDomainObjects(revealRenderTarget)];

    expect(results).toHaveLength(3);

    expect(results[0]).toBe(cadDomainObject);
    expect(results[1]).toBe(pointCloudDomainObject);
    expect(results[2]).toBe(image360DomainObject);
  });

  test('results are filtered by supplied predicate', () => {
    const revealRenderTarget = createRenderTargetMock();

    const cadDomainObject = new CadDomainObject(createCadMock());
    const pointCloudDomainObject = new PointCloudDomainObject(createPointCloudMock());

    revealRenderTarget.rootDomainObject.addChild(cadDomainObject);
    revealRenderTarget.rootDomainObject.addChild(pointCloudDomainObject);

    const results = [
      ...getRevealDomainObjects(revealRenderTarget, (obj) => obj instanceof CadDomainObject)
    ];

    expect(results).toHaveLength(1);
    expect(results[0]).toBe(cadDomainObject);
  });
});

class DummyDomainObject extends DomainObject {
  typeName = { untranslated: 'DummyDomainObject' };
}
