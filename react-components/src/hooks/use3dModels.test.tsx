import { describe, expect, test } from 'vitest';
import { renderHook } from '@testing-library/react';

import { createCadMock } from '#test-utils/fixtures/cadModel';
import { defaultUse3dModelsDependencies, use3dModels, Use3dModelsContext } from './use3dModels';
import { type ReactElement, type PropsWithChildren } from 'react';
import { PointCloudDomainObject } from '../architecture/concrete/reveal/pointCloud/PointCloudDomainObject';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';
import { CadDomainObject } from '../architecture/concrete/reveal/cad/CadDomainObject';
import { Image360CollectionDomainObject } from '../architecture/concrete/reveal/Image360Collection/Image360CollectionDomainObject';
import { createImage360ClassicMock } from '#test-utils/fixtures/image360';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';

describe(use3dModels.name, () => {
  const dependencies = getMocksByDefaultDependencies(defaultUse3dModelsDependencies);

  const cadModelFixture = createCadMock();
  const pointCloudModelFixture = createPointCloudMock();
  const image360CollectionFixture = createImage360ClassicMock();

  const cadDomainObjectFixture = new CadDomainObject(cadModelFixture);
  const pointCloudDomainObjectFixture = new PointCloudDomainObject(pointCloudModelFixture);
  const image360CollectionDomainObjectFixture = new Image360CollectionDomainObject(
    image360CollectionFixture
  );

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <Use3dModelsContext.Provider value={dependencies}>{children}</Use3dModelsContext.Provider>
  );

  test('returns empty list if no Reveal domain objects are found', () => {
    dependencies.useRevealDomainObjects.mockReturnValue([]);
    const { result } = renderHook(() => use3dModels(), { wrapper });
    expect(result.current).toEqual([]);
  });

  test('returns Reveal CAD and point cloud models in the DomainObject graph', () => {
    dependencies.useRevealDomainObjects.mockReturnValue([
      cadDomainObjectFixture,
      pointCloudDomainObjectFixture,
      image360CollectionDomainObjectFixture
    ]);

    const { result } = renderHook(() => use3dModels(), { wrapper });

    expect(result.current).toHaveLength(2);
    expect(result.current[0]).toBe(cadModelFixture);
    expect(result.current[1]).toBe(pointCloudModelFixture);
  });

  test('return value should be stable until `useRevealDomainObjects` returns a new reference', () => {
    dependencies.useRevealDomainObjects.mockReturnValue([cadDomainObjectFixture]);

    const { result, rerender } = renderHook(() => use3dModels(), { wrapper });

    const initialResult = result.current;

    rerender();

    const secondResult = result.current;

    expect(secondResult).toBe(initialResult);

    dependencies.useRevealDomainObjects.mockReturnValue([
      cadDomainObjectFixture,
      pointCloudDomainObjectFixture
    ]);

    rerender();

    const resultAfterChange = result.current;

    expect(resultAfterChange).not.toBe(initialResult);

    expect(resultAfterChange).toHaveLength(2);
    expect(resultAfterChange[0]).toBe(cadModelFixture);
    expect(resultAfterChange[1]).toBe(pointCloudModelFixture);
  });
});
