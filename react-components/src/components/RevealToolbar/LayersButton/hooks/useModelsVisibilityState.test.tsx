import { beforeEach, describe, expect, test } from 'vitest';
import { useModelsVisibilityState } from './useModelsVisibilityState';
import { renderHook } from '@testing-library/react';
import { createCadMock } from '#test-utils/fixtures/cadModel';
import { createImage360ClassicMock } from '#test-utils/fixtures/image360';
import { type PropsWithChildren, type ReactElement } from 'react';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';
import {
  CadDomainObject,
  Image360CollectionDomainObject,
  PointCloudDomainObject
} from '../../../../architecture';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import {
  defaultUseModelsVisibilityStateDependencies,
  UseModelsVisibilityStateContext
} from './useModelsVisibilityState.context';

describe(useModelsVisibilityState.name, () => {
  let cadObject: CadDomainObject;
  let pointCloudObject: PointCloudDomainObject;
  let image360CollectionObject: Image360CollectionDomainObject;
  const dependencies = getMocksByDefaultDependencies(defaultUseModelsVisibilityStateDependencies);

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <UseModelsVisibilityStateContext.Provider value={dependencies}>
      {children}
    </UseModelsVisibilityStateContext.Provider>
  );

  beforeEach(() => {
    cadObject = new CadDomainObject(createCadMock());
    pointCloudObject = new PointCloudDomainObject(createPointCloudMock());
    image360CollectionObject = new Image360CollectionDomainObject(createImage360ClassicMock());

    pointCloudObject.setVisibleInteractive(false);
    dependencies.useRevealDomainObjects.mockReturnValue([
      cadObject,
      pointCloudObject,
      image360CollectionObject
    ]);

    dependencies.useVisibleRevealDomainObjects.mockReturnValue([
      cadObject,
      image360CollectionObject
    ]);
  });

  test('returns models', () => {
    const { result } = renderHook(() => useModelsVisibilityState(), {
      wrapper
    });

    expect(result.current.cadModels).toEqual([cadObject]);
    expect(result.current.pointClouds).toEqual([pointCloudObject]);
    expect(result.current.image360Collections).toEqual([image360CollectionObject]);
  });

  test('returns stable value across rerenders', () => {
    const { result, rerender } = renderHook(() => useModelsVisibilityState(), {
      wrapper
    });

    const firstResult = result.current;

    rerender();

    const secondResult = result.current;

    expect(secondResult).toBe(firstResult);
  });

  test('updates return value if domain model list updates', () => {
    const { result, rerender } = renderHook(() => useModelsVisibilityState(), {
      wrapper
    });

    const firstResult = result.current;

    dependencies.useRevealDomainObjects.mockReturnValue([cadObject, image360CollectionObject]);

    rerender();

    const secondResult = result.current;

    expect(secondResult).not.toBe(firstResult);
    expect(secondResult).toEqual({
      cadModels: [cadObject],
      pointClouds: [],
      image360Collections: [image360CollectionObject]
    });
  });

  test('updates return value if model visibility list updates', () => {
    const { result, rerender } = renderHook(() => useModelsVisibilityState(), {
      wrapper
    });

    const firstResult = result.current;

    dependencies.useVisibleRevealDomainObjects.mockReturnValue([
      cadObject,
      pointCloudObject,
      image360CollectionObject
    ]);

    rerender();

    const secondResult = result.current;

    // Result is same, but should return a new object
    expect(secondResult).not.toBe(firstResult);
    expect(secondResult).toEqual(firstResult);
  });
});
