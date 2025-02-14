/*!
 * Copyright 2025 Cognite AS
 */
import { render, screen } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import { Reveal3DResources } from './Reveal3DResources';
import { type Reveal3DResourcesProps } from './types';
import {
  Reveal3DResourcesContext,
  type Reveal3DResourcesDependencies
} from './Reveal3DResources.context';
import type { PropsWithChildren, ReactElement } from 'react';

describe('Reveal3DResources', () => {
  const defaultProps: Reveal3DResourcesProps = {
    resources: []
  };

  const dependencies: Reveal3DResourcesDependencies = {
    // Hooks
    useReveal: vi.fn(),
    useRemoveNonReferencedModels: vi.fn(),
    useTypedModels: vi.fn(),
    useSetExpectedLoadCount: vi.fn(),
    useCallCallbackOnFinishedLoading: vi.fn(),
    useAssetMappedNodesForRevisions: vi.fn(),
    useGenerateAssetMappingCachePerItemFromModelCache: vi.fn(),
    useGenerateNode3DCache: vi.fn(),
    useCalculateCadStyling: vi.fn(),
    useReveal3DResourcesStylingLoadingSetter: vi.fn(),
    useCalculatePointCloudStyling: vi.fn(),
    useCalculateImage360Styling: vi.fn(),

    // SubComponents
    CadModelContainer: vi.fn(),
    PointCloudContainer: vi.fn(),
    Image360CollectionContainer: vi.fn()
  };

  it('renders without crashing', () => {
    const wrapper = ({ children }: PropsWithChildren): ReactElement => (
      <Reveal3DResourcesContext.Provider value={dependencies}>
        {children}
      </Reveal3DResourcesContext.Provider>
    );
    render(<Reveal3DResources {...defaultProps} />, { wrapper });
    screen.debug();
  });
});
