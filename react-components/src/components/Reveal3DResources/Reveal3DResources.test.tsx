/*!
 * Copyright 2025 Cognite AS
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PropsWithChildren, ReactElement } from 'react';
import { Reveal3DResources } from './Reveal3DResources';
import type {
  AddImage360CollectionOptions,
  Reveal3DResourcesProps,
  StyledPointCloudModel
} from './types';
import {
  Reveal3DResourcesContext,
  type Reveal3DResourcesDependencies
} from './Reveal3DResources.context';
import type { StyledModel } from './hooks/useCalculateCadStyling';

describe(Reveal3DResources.name, () => {
  const defaultProps: Reveal3DResourcesProps = {
    resources: []
  };

  const defaultDependencies: Reveal3DResourcesDependencies = {
    // Hooks
    useReveal: vi.fn(),
    useRenderTarget: vi.fn(),
    useRemoveNonReferencedModels: vi.fn(),
    useTypedModels: vi.fn(() => ({ data: [], loading: false }) as any),
    useSetExpectedLoadCount: vi.fn(() => {}),
    useCallCallbackOnFinishedLoading: vi.fn(),
    useAssetMappedNodesForRevisions: vi.fn(() => ({ data: [] }) as any),
    useGenerateAssetMappingCachePerItemFromModelCache: vi.fn(),
    useGenerateNode3DCache: vi.fn(),
    useCalculateCadStyling: vi.fn(() => ({ styledModels: [], isModelMappingsLoading: false })),
    useReveal3DResourcesStylingLoadingSetter: vi.fn(() => () => {}),
    useCalculatePointCloudStyling: vi.fn(() => []),
    useCalculateImage360Styling: vi.fn(),

    // SubComponents
    CadModelContainer: vi.fn(),
    PointCloudContainer: vi.fn(),
    Image360CollectionContainer: vi.fn()
  };

  it('renders without crashing with empty data', () => {
    const wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <Reveal3DResourcesContext.Provider value={defaultDependencies}>
        {children}
      </Reveal3DResourcesContext.Provider>
    );
    render(<Reveal3DResources {...defaultProps} />, { wrapper });
    screen.debug();
  });

  it('should mount CadModelContainer if styling is resolved', () => {
    const CadModelContainer = vi.fn();

    const deps = {
      ...defaultDependencies,
      useCalculateCadStyling: vi.fn(() => {
        const styledModels: StyledModel[] = [
          {
            model: { modelId: 1, revisionId: 1, type: 'cad' },
            styleGroups: []
          },
          {
            model: { modelId: 2, revisionId: 2, type: 'cad' },
            styleGroups: []
          }
        ];
        return { styledModels, isModelMappingsLoading: false };
      }),
      CadModelContainer
    };

    const wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <Reveal3DResourcesContext.Provider value={deps}>{children}</Reveal3DResourcesContext.Provider>
    );
    render(<Reveal3DResources resources={[]} />, {
      wrapper
    });
    expect(CadModelContainer).toHaveBeenCalledTimes(2);
    screen.debug();
  });

  it('should mount PointCloudContainer if styling is resolved', () => {
    const PointCloudContainer = vi.fn();

    const deps = {
      ...defaultDependencies,
      useCalculatePointCloudStyling: vi.fn(() => {
        const styledModels: StyledPointCloudModel[] = [
          {
            model: { modelId: 1, revisionId: 1, type: 'pointcloud' },
            styleGroups: []
          },
          {
            model: { modelId: 2, revisionId: 2, type: 'pointcloud' },
            styleGroups: []
          },
          {
            model: { modelId: 3, revisionId: 3, type: 'pointcloud' },
            styleGroups: []
          }
        ];
        return styledModels;
      }),
      PointCloudContainer
    };

    const wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <Reveal3DResourcesContext.Provider value={deps}>{children}</Reveal3DResourcesContext.Provider>
    );
    render(<Reveal3DResources resources={[]} />, {
      wrapper
    });
    expect(PointCloudContainer).toHaveBeenCalledTimes(3);
    screen.debug();
  });

  it('should mount Image360Containers if resource is passed', () => {
    const Image360CollectionContainer = vi.fn();

    const deps = {
      ...defaultDependencies,
      Image360CollectionContainer
    };

    const resources: AddImage360CollectionOptions[] = [
      {
        source: 'events',
        siteId: 'test_site_id'
      }
    ];

    const wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <Reveal3DResourcesContext.Provider value={deps}>{children}</Reveal3DResourcesContext.Provider>
    );
    render(<Reveal3DResources resources={resources} />, {
      wrapper
    });
    expect(Image360CollectionContainer).toHaveBeenCalledTimes(1);
    screen.debug();
  });
});
