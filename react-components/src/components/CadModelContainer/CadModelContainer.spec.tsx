import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CadModelContainer } from './CadModelContainer';
import { CadModelContext, defaultCadModelContextDependencies } from './CadModelContainer.context';
import type { PropsWithChildren, ReactElement } from 'react';
import { Mock } from 'moq.ts';
import type { RevealRenderTarget } from '../../architecture';
import { type CogniteCadModel, type Cognite3DViewer, type CogniteModel } from '@cognite/reveal';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';

describe(CadModelContainer.name, () => {
  const deps = getMocksByDefaultDependencies(defaultCadModelContextDependencies);

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
    deps.useRenderTarget.mockReturnValue(renderTargetMock.object());

    deps.useReveal3DResourcesCount.mockReturnValue({
      reveal3DResourcesCount: 0,
      setRevealResourcesCount: vi.fn()
    });

    deps.useReveal3DResourceLoadFailCount.mockReturnValue({
      reveal3DResourceLoadFailCount: 0,
      setReveal3DResourceLoadFailCount: vi.fn()
    });

    const cadModel = new Mock<CogniteCadModel>().object();
    deps.createCadDomainObject.mockResolvedValue(cadModel);
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
