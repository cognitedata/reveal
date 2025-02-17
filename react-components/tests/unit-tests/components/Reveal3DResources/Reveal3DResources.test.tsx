/*!
 * Copyright 2025 Cognite AS
 */
import { render, screen } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import { Reveal3DResources } from '../../../../src/components/Reveal3DResources/Reveal3DResources';
import { type Reveal3DResourcesProps } from '../../../../src/components/Reveal3DResources/types';
import {
  Reveal3DResourcesContext,
  type Reveal3DResourcesDependencies
} from '../../../../src/components/Reveal3DResources/Reveal3DResources.context';
import type { PropsWithChildren, ReactElement } from 'react';

describe(Reveal3DResources.name, () => {
  const defaultProps: Reveal3DResourcesProps = {
    resources: []
  };

  const defaultDependencies: Reveal3DResourcesDependencies = {
    // Hooks
    useReveal: vi.fn(),
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
});
