import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CadModelContainer } from './CadModelContainer';
import { CadModelContext, type CadModelContextDependencies } from './CadModelContainer.context';
import type { PropsWithChildren, ReactElement } from 'react';
import { Mock } from 'moq.ts';
import type { RevealRenderTarget } from '../../architecture';
import { type CogniteCadModel, type Cognite3DViewer, type CogniteModel } from '@cognite/reveal';

describe('CadModelContainer', () => {
  const deps: CadModelContextDependencies = {
    useRevealKeepAlive: vi.fn(),
    useRenderTarget: vi.fn(),
    useReveal3DResourcesCount: vi.fn(),
    useReveal3DResourceLoadFailCount: vi.fn(),
    useApplyCadModelStyling: vi.fn(),
    createCadDomainObject: vi.fn(),
    removeCadDomainObject: vi.fn()
  };

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <CadModelContext.Provider value={deps}>{children}</CadModelContext.Provider>
  );

  it('should properly add and remove Cad Model when mounting and unmounting CadModelContainer', async () => {
    const models = vi.fn<() => CogniteModel[]>();
    const renderTargetMock = new Mock<RevealRenderTarget>()
      .setup((x) => x.viewer)
      .returns(
        new Mock<Cognite3DViewer>()
          .setup((x) => x.models)
          .callback(models)
          .setup((x) => x.get360ImageCollections)
          .returns(() => [])
          .object()
      );
    vi.mocked(deps.useRenderTarget).mockReturnValue(renderTargetMock.object());

    vi.mocked(deps.useReveal3DResourcesCount).mockReturnValue({
      reveal3DResourcesCount: 0,
      setRevealResourcesCount: vi.fn()
    });

    vi.mocked(deps.useReveal3DResourceLoadFailCount).mockReturnValue({
      reveal3DResourceLoadFailCount: 0,
      setReveal3DResourceLoadFailCount: vi.fn()
    });

    const cadModel = new Mock<CogniteCadModel>().object();
    vi.mocked(deps.createCadDomainObject).mockResolvedValue(cadModel);
    models.mockReturnValue([]);

    const addModelOptions1 = { modelId: 1, revisionId: 1 };

    const { unmount } = render(
      <CadModelContainer addModelOptions={addModelOptions1} onLoad={vi.fn()} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(deps.createCadDomainObject).toHaveBeenCalled();
    });

    models.mockReturnValue([cadModel]);

    unmount();

    await waitFor(() => {
      expect(deps.removeCadDomainObject).toHaveBeenCalled();
    });
  });
});
