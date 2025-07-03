import { describe, expect, test, vi } from 'vitest';
import {
  useImage360Collections,
  UseImage360CollectionsContext,
  UseImage360CollectionsDependencies
} from './useImage360Collections';
import { PropsWithChildren, ReactElement, useMemo } from 'react';
import { renderHook } from '@testing-library/react';
import { CadDomainObject } from '../architecture/concrete/reveal/cad/CadDomainObject';
import { createCadMock } from '#test-utils/fixtures/cadModel';
import { Image360CollectionDomainObject } from '../architecture/concrete/reveal/Image360Collection/Image360CollectionDomainObject';
import { createImage360ClassicMock, createImage360DmMock } from '#test-utils/fixtures/image360';
import { PointCloudDomainObject } from '../architecture/concrete/reveal/pointCloud/PointCloudDomainObject';
import { createPointCloudDMMock } from '#test-utils/fixtures/pointCloud';

describe(useImage360Collections.name, () => {
  const mockUseRevealDomainObjects =
    vi.fn<UseImage360CollectionsDependencies['useRevealDomainObjects']>();

  const CAD_DOMAIN_OBJECT = new CadDomainObject(createCadMock());
  const POINT_CLOUD_DOMAIN_OBJECT = new PointCloudDomainObject(createPointCloudDMMock());
  const IMAGE_360_CLASSIC_DOMAIN_OBJECT = new Image360CollectionDomainObject(
    createImage360ClassicMock()
  );
  const IMAGE_360_DM_DOMAIN_OBJECT = new Image360CollectionDomainObject(createImage360DmMock());

  const ALL_OBJECTS = [
    CAD_DOMAIN_OBJECT,
    POINT_CLOUD_DOMAIN_OBJECT,
    IMAGE_360_CLASSIC_DOMAIN_OBJECT,
    IMAGE_360_DM_DOMAIN_OBJECT
  ];

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <UseImage360CollectionsContext.Provider
      value={{ useRevealDomainObjects: mockUseRevealDomainObjects }}>
      {children}
    </UseImage360CollectionsContext.Provider>
  );

  test('returns all 360 image objects', () => {
    mockUseRevealDomainObjects.mockReturnValue(ALL_OBJECTS);

    const { result } = renderHook(() => useImage360Collections(), { wrapper });

    expect(result.current).toHaveLength(2);
    expect(result.current[0]).toBe(IMAGE_360_CLASSIC_DOMAIN_OBJECT.model);
    expect(result.current[1]).toBe(IMAGE_360_DM_DOMAIN_OBJECT.model);
  });

  test('return reference is stable over rerenders', () => {
    mockUseRevealDomainObjects.mockReturnValue(ALL_OBJECTS);

    const { result, rerender } = renderHook(() => useImage360Collections(), { wrapper });
    const initialValue = result.current;

    rerender();

    expect(result.current).toBe(initialValue);
  });

  test('returns new models on rerender when result from useRevealDomainObjects changes', () => {
    mockUseRevealDomainObjects.mockReturnValue(ALL_OBJECTS);

    const { result, rerender } = renderHook(() => useImage360Collections(), { wrapper });
    const initialValue = result.current;

    mockUseRevealDomainObjects.mockReturnValue([CAD_DOMAIN_OBJECT, IMAGE_360_DM_DOMAIN_OBJECT]);

    rerender();

    expect(result.current).not.toBe(initialValue);

    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toBe(IMAGE_360_DM_DOMAIN_OBJECT.model);
  });
});
