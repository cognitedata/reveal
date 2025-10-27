import { beforeEach, describe, expect, test } from 'vitest';
import { useCalculatePointCloudStyling } from './useCalculatePointCloudStyling';
import { renderHook } from '@testing-library/react';
import {
  defaultUseCalculatePointCloudStylingDependencies,
  UseCalculatePointCloudStylingContext
} from './useCalculatePointCloudStyling.context';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import { type ReactElement, type PropsWithChildren } from 'react';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';
import { createCadMock } from '#test-utils/fixtures/cadModel';
import { Box3, Color } from 'three';
import { type NodeAppearance } from '@cognite/reveal';
import {
  type ClassicAssetStylingGroup,
  type DefaultResourceStyling,
  type PointCloudModelOptions
} from '../types';

describe(useCalculatePointCloudStyling.name, () => {
  const MODEL_ID = 123;
  const REVISION_ID = 234;
  const ANNOTATION_ID0 = 345;
  const ASSET_ID = 567;

  const ARBITRARY_POINT_CLOUD_APPEARANCE: NodeAppearance = {
    color: new Color(0, 0.5, 1),
    renderGhosted: true
  };

  const ASSET_STYLING_GROUP: ClassicAssetStylingGroup = {
    assetIds: [ASSET_ID],
    style: { pointcloud: ARBITRARY_POINT_CLOUD_APPEARANCE }
  };

  const MODEL_OPTIONS: PointCloudModelOptions = {
    modelId: MODEL_ID,
    revisionId: REVISION_ID,
    type: 'pointcloud'
  };

  const mockDependencies = getMocksByDefaultDependencies(
    defaultUseCalculatePointCloudStylingDependencies
  );

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <UseCalculatePointCloudStylingContext.Provider value={mockDependencies}>
      {children}
    </UseCalculatePointCloudStylingContext.Provider>
  );

  const pointCloudMock = createPointCloudMock({
    modelId: MODEL_ID,
    revisionId: REVISION_ID,
    stylableObjects: [
      { annotationId: ANNOTATION_ID0, boundingBox: new Box3(), assetRef: { id: ASSET_ID } }
    ]
  });

  beforeEach(() => {
    mockDependencies.use3dModels.mockReturnValue([pointCloudMock]);
  });

  test('should return no styling groups for empty input model list', () => {
    const { result } = renderHook(() => useCalculatePointCloudStyling([], [ASSET_STYLING_GROUP]), {
      wrapper
    });

    expect(result.current).toHaveLength(0);
  });

  test('should return no styling groups for empty input styling list', () => {
    const { result } = renderHook(
      () =>
        useCalculatePointCloudStyling(
          [{ type: 'pointcloud', modelId: MODEL_ID, revisionId: REVISION_ID }],
          []
        ),
      { wrapper }
    );
    expect(result.current).toEqual([
      {
        model: MODEL_OPTIONS,
        styleGroups: []
      }
    ]);
  });

  test('should return no styling groups if there are no viewer models', () => {
    mockDependencies.use3dModels.mockReturnValue([]);
    const { result } = renderHook(
      () =>
        useCalculatePointCloudStyling(
          [{ type: 'pointcloud', modelId: MODEL_ID, revisionId: REVISION_ID }],
          [ASSET_STYLING_GROUP]
        ),
      { wrapper }
    );
    expect(result.current).toEqual([
      {
        model: MODEL_OPTIONS,
        styleGroups: []
      }
    ]);
  });

  test('should return one styling group when there is one styling group in input', () => {
    const { result } = renderHook(
      () =>
        useCalculatePointCloudStyling(
          [{ type: 'pointcloud', modelId: MODEL_ID, revisionId: REVISION_ID }],
          [ASSET_STYLING_GROUP]
        ),
      { wrapper }
    );
    expect(result.current).toEqual([
      {
        model: MODEL_OPTIONS,
        styleGroups: [
          { pointCloudVolumes: [ANNOTATION_ID0], style: ARBITRARY_POINT_CLOUD_APPEARANCE }
        ]
      }
    ]);
  });

  test('should ignore CAD models in viewer and input', () => {
    mockDependencies.use3dModels.mockReturnValue([createCadMock()]);
    const { result } = renderHook(
      () =>
        useCalculatePointCloudStyling(
          [{ type: 'cad', modelId: MODEL_ID, revisionId: REVISION_ID }],
          [ASSET_STYLING_GROUP]
        ),
      { wrapper }
    );
    expect(result.current).toHaveLength(0);
  });

  test('should return appropriate styling groups for default "mapped"-styling', () => {
    const mappedStyling: NodeAppearance = { color: new Color('red') };
    const defaultStyles: DefaultResourceStyling = {
      pointcloud: { mapped: mappedStyling, default: {} }
    };

    const { result } = renderHook(
      () =>
        useCalculatePointCloudStyling(
          [{ type: 'pointcloud', modelId: MODEL_ID, revisionId: REVISION_ID }],
          [],
          defaultStyles
        ),
      { wrapper }
    );
    expect(result.current).toEqual([
      {
        model: MODEL_OPTIONS,
        styleGroups: [{ pointCloudVolumes: [ANNOTATION_ID0], style: mappedStyling }]
      }
    ]);
  });
});
