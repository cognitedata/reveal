import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

  const modelsGetter = vi.fn<() => CogniteModel[]>();
  const cadModel = new Mock<CogniteCadModel>().object();

  const renderTargetMock = new Mock<RevealRenderTarget>()
    .setup((x) => x.viewer)
    .returns(
      new Mock<Cognite3DViewer>()
        .setup((x) => x.models)
        .callback(modelsGetter)
        .setup((x) => x.get360ImageCollections)
        .returns(() => [])
        .object()
    );

  beforeEach(() => {
    deps.useRenderTarget.mockReturnValue(renderTargetMock.object());

    deps.useReveal3DResourcesCount.mockReturnValue({
      reveal3DResourcesCount: 0,
      setRevealResourcesCount: vi.fn()
    });

    deps.useReveal3DResourceLoadFailCount.mockReturnValue({
      reveal3DResourceLoadFailCount: 0,
      setReveal3DResourceLoadFailCount: vi.fn()
    });
    deps.createCadDomainObject.mockResolvedValue(cadModel);
    modelsGetter.mockReturnValue([]);
  });

  it('should properly add and remove Cad Model when mounting and unmounting CadModelContainer', async () => {
    const addModelOptions1 = { modelId: 1, revisionId: 1 };

    const { unmount } = render(
      <CadModelContainer addModelOptions={addModelOptions1} onLoad={vi.fn()} />,
      { wrapper }
    );

    await waitFor(() => {
      expect(deps.createCadDomainObject).toHaveBeenCalled();
    });

    modelsGetter.mockReturnValue([cadModel]);

    unmount();

    await waitFor(() => {
      expect(deps.removeCadDomainObject).toHaveBeenCalled();
    });
  });

  it.each([undefined, false, true])(
    'should propagate defaultVisible flag %s to `createCadModel`',
    async (defaultVisibleFlag) => {
      const addModelOptions1 = { modelId: 1, revisionId: 1 };

      render(
        <CadModelContainer
          addModelOptions={addModelOptions1}
          onLoad={vi.fn()}
          defaultVisible={defaultVisibleFlag}
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(deps.createCadDomainObject).toHaveBeenCalledWith(
          renderTargetMock.object(),
          addModelOptions1,
          defaultVisibleFlag
        );
      });
    }
  );
});
