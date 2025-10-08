import { beforeEach, describe, expect, test } from 'vitest';
import {
  useVisibleRevealDomainObjects,
  UseVisibleRevealDomainObjectsContext
} from './useVisibleRevealDomainObjects';
import { CadDomainObject } from '../architecture/concrete/reveal/cad/CadDomainObject';
import { createCadMock } from '#test-utils/fixtures/cadModel';
import { PointCloudDomainObject } from '../architecture/concrete/reveal/pointCloud/PointCloudDomainObject';
import { createPointCloudDMMock } from '#test-utils/fixtures/pointCloud';
import { Image360CollectionDomainObject } from '../architecture/concrete/reveal/Image360Collection/Image360CollectionDomainObject';
import { createImage360ClassicMock } from '#test-utils/fixtures/image360';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { type RevealRenderTarget } from '../architecture';
import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren, ReactElement } from 'react';
import { type RevealDomainObject } from '../architecture/concrete/reveal/RevealDomainObject';

describe(useVisibleRevealDomainObjects.name, () => {
  let renderTarget: RevealRenderTarget;

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <UseVisibleRevealDomainObjectsContext.Provider
      value={{
        useRenderTarget: () => renderTarget
      }}>
      {children}
    </UseVisibleRevealDomainObjectsContext.Provider>
  );

  beforeEach(() => {
    renderTarget = createRenderTargetMock();
  });

  test('returns only visible Reveal domain objects', () => {
    const [domainObject0, _domainObject1, domainObject2] =
      populateRenderTargetAndGetModels(renderTarget);

    domainObject0.setVisibleInteractive(true, renderTarget);
    domainObject2.setVisibleInteractive(true, renderTarget);

    const { result } = renderHook(() => useVisibleRevealDomainObjects(), { wrapper });

    expect(result.current).toHaveLength(2);
    expect(result.current[0]).toBe(domainObject0);
    expect(result.current[1]).toBe(domainObject2);
  });

  test('returns new result when visibility state changes', () => {
    const [domainObject0, domainObject1, domainObject2] =
      populateRenderTargetAndGetModels(renderTarget);

    domainObject0.setVisibleInteractive(true, renderTarget);
    domainObject2.setVisibleInteractive(true, renderTarget);

    const { result } = renderHook(() => useVisibleRevealDomainObjects(), { wrapper });

    const initialResult = result.current;

    act(() => {
      domainObject0.setVisibleInteractive(false, renderTarget);
      domainObject1.setVisibleInteractive(true, renderTarget);
    });

    expect(result.current).not.toBe(initialResult);
    expect(result.current).toHaveLength(2);
    expect(result.current[0]).toBe(domainObject1);
    expect(result.current[1]).toBe(domainObject2);
  });
});

function populateRenderTargetAndGetModels(renderTarget: RevealRenderTarget): RevealDomainObject[] {
  const cadDomainObject = new CadDomainObject(createCadMock());
  const pointCloudDomainObject = new PointCloudDomainObject(createPointCloudDMMock());
  const image360DomainObject = new Image360CollectionDomainObject(createImage360ClassicMock());

  renderTarget.root.addChildInteractive(cadDomainObject);
  renderTarget.root.addChildInteractive(pointCloudDomainObject);
  renderTarget.root.addChildInteractive(image360DomainObject);

  return [cadDomainObject, pointCloudDomainObject, image360DomainObject];
}
