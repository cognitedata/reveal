/*!
 * Copyright 2025 Cognite AS
 */
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { useModelHandlers } from './useModelHandlers';
import { renderHook } from '@testing-library/react';
import {
  viewerImage360CollectionsMock,
  viewerMock,
  viewerModelsMock
} from '#test-utils/fixtures/viewer';
import { type CogniteModel } from '@cognite/reveal';
import { cadMock, createCadMock } from '#test-utils/fixtures/cadModel';
import { createImage360ClassicMock } from '#test-utils/fixtures/image360';
import { wrapper } from '#test-utils/fixtures/wrapper';
import { type LayersUrlStateParam } from '../types';
import { type Dispatch, type SetStateAction } from 'react';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';
import { type use3DModelName } from '../../../../query';
import { type UseQueryResult } from '@tanstack/react-query';
import { Mock } from 'moq.ts';

const use3DModelNameMock = vi.fn<typeof use3DModelName>();

describe(useModelHandlers.name, () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns model handlers and update callback', () => {
    const mockNameQueryResult = createUseQueryModelNameResult(['model0', 'model1']);
    use3DModelNameMock.mockReturnValue(mockNameQueryResult);

    const mockModels: CogniteModel[] = [cadMock, cadMock];
    viewerModelsMock.mockReturnValue(mockModels);
    const mockImage360Collection = createImage360ClassicMock();
    viewerImage360CollectionsMock.mockReturnValue([mockImage360Collection]);

    const { result } = renderHook(
      () => useModelHandlers(undefined, undefined, viewerMock, mockModels, use3DModelNameMock),
      { wrapper }
    );

    const [modelHandlers, update] = result.current;

    expect(modelHandlers).toBeDefined();
    expect(update).toBeDefined();
  });

  test('calling update updates external layer state', () => {
    const mockNameQueryResult = createUseQueryModelNameResult([
      'model0',
      'model1',
      'model2',
      'model3'
    ]);
    use3DModelNameMock.mockReturnValue(mockNameQueryResult);

    const cadMock0 = createCadMock({ visible: true });
    const cadMock1 = createCadMock({ visible: false });

    const pointCloudMock0 = createPointCloudMock({ visible: false });
    const pointCloudMock1 = createPointCloudMock({ visible: true });

    const image360CollectionMock0 = createImage360ClassicMock({ visible: true });
    const image360CollectionMock1 = createImage360ClassicMock({ visible: false });

    const mockModels: CogniteModel[] = [cadMock0, pointCloudMock0, pointCloudMock1, cadMock1];

    viewerModelsMock.mockReturnValue(mockModels);
    viewerImage360CollectionsMock.mockReturnValue([
      image360CollectionMock0,
      image360CollectionMock1
    ]);

    const setExternalState = vi.fn<Dispatch<SetStateAction<LayersUrlStateParam | undefined>>>();

    const { result } = renderHook(
      () =>
        useModelHandlers(setExternalState, undefined, viewerMock, mockModels, use3DModelNameMock),
      { wrapper }
    );

    const [_modelHandlers, update] = result.current;

    update();

    expect(setExternalState).toHaveBeenCalledOnce();
    const returnedObject = setExternalState.mock.calls[0][0] as LayersUrlStateParam | undefined;

    expect(returnedObject).toBeDefined();

    expect(returnedObject?.cadLayers).toHaveLength(2);
    expect(returnedObject?.pointCloudLayers).toHaveLength(2);
    expect(returnedObject?.image360Layers).toHaveLength(2);

    expect(returnedObject?.cadLayers?.[0].applied).toBe(cadMock0.visible);
    expect(returnedObject?.cadLayers?.[1].applied).toBe(cadMock1.visible);

    expect(returnedObject?.pointCloudLayers?.[0].applied).toBe(pointCloudMock0.visible);
    expect(returnedObject?.pointCloudLayers?.[1].applied).toBe(pointCloudMock1.visible);

    expect(returnedObject?.image360Layers?.[0].applied).toBe(
      image360CollectionMock0.getIconsVisibility()
    );
    expect(returnedObject?.image360Layers?.[1].applied).toBe(
      image360CollectionMock1.getIconsVisibility()
    );
  });
});

function createUseQueryModelNameResult(
  modelNames: Array<string | undefined>
): UseQueryResult<Array<string | undefined>, unknown> {
  return new Mock<UseQueryResult<Array<string | undefined>>>()
    .setup((p) => p.data)
    .returns(modelNames)
    .object();
}
