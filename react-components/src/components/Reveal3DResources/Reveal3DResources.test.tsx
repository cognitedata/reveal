import { render } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PropsWithChildren, ReactElement } from 'react';
import { Reveal3DResources } from './Reveal3DResources';
import type { AddImage360CollectionOptions } from './types';
import {
  defaultReveal3DResourcesDependencies,
  Reveal3DResourcesContext
} from './Reveal3DResources.context';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';

describe(Reveal3DResources.name, () => {
  const defaultDependencies = getMocksByDefaultDependencies(defaultReveal3DResourcesDependencies);

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <Reveal3DResourcesContext.Provider value={defaultDependencies}>
      {children}
    </Reveal3DResourcesContext.Provider>
  );

  beforeAll(() => {
    defaultDependencies.useTypedModels.mockImplementation(
      () => ({ data: [], loading: false }) as any
    );
    defaultDependencies.useSetExpectedLoadCount.mockImplementation(() => {});
    defaultDependencies.useAssetMappedNodesForRevisions.mockImplementation(
      () => ({ data: [] }) as any
    );
    defaultDependencies.useCalculateCadStyling.mockImplementation(() => ({
      styledModels: [],
      isModelMappingsLoading: false
    }));
    defaultDependencies.useReveal3DResourcesStylingLoadingSetter.mockImplementation(() => () => {});
    defaultDependencies.useCalculatePointCloudStyling.mockImplementation(() => []);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing with empty data', () => {
    render(<Reveal3DResources resources={[]} />, { wrapper });
  });

  it('should mount CadModelContainer if styling is resolved', () => {
    defaultDependencies.useCalculateCadStyling.mockReturnValue({
      styledModels: [
        {
          model: { modelId: 1, revisionId: 1, type: 'cad' },
          styleGroups: []
        },
        {
          model: { modelId: 2, revisionId: 2, type: 'cad' },
          styleGroups: []
        }
      ],
      isModelMappingsLoading: false
    });

    render(<Reveal3DResources resources={[]} />, {
      wrapper
    });
    expect(defaultDependencies.CadModelContainer).toHaveBeenCalledTimes(2);
  });

  it('should mount PointCloudContainer if styling is resolved', () => {
    defaultDependencies.useCalculatePointCloudStyling.mockReturnValue([
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
    ]);

    render(<Reveal3DResources resources={[]} />, {
      wrapper
    });

    expect(defaultDependencies.PointCloudContainer).toHaveBeenCalledTimes(3);
  });

  it('should mount Image360Containers if resource is passed', () => {
    const resources: AddImage360CollectionOptions[] = [
      {
        source: 'events',
        siteId: 'test_site_id'
      }
    ];

    render(<Reveal3DResources resources={resources} />, {
      wrapper
    });

    expect(defaultDependencies.Image360CollectionContainer).toHaveBeenCalledTimes(1);
  });
});
