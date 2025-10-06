import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Image360CollectionContainer } from './Image360CollectionContainer';
import {
  Image360CollectionContainerContext,
  defaultImage360CollectionContainerContextDependencies
} from './Image360CollectionContainer.context';
import type { PropsWithChildren, ReactElement } from 'react';
import { Mock } from 'moq.ts';
import type { RevealRenderTarget } from '../../architecture';
import {
  type Image360Collection,
  type Cognite3DViewer,
  type ClassicDataSourceType
} from '@cognite/reveal';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import type { AddImage360CollectionOptions } from '../Reveal3DResources/types';
import * as useApply360AnnotationStylingModule from './useApply360AnnotationStyling';

describe(Image360CollectionContainer.name, () => {
  const deps = getMocksByDefaultDependencies(defaultImage360CollectionContainerContextDependencies);

  const wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <Image360CollectionContainerContext.Provider value={deps}>
      {children}
    </Image360CollectionContainerContext.Provider>
  );

  const collectionsGetter = vi.fn<() => Image360Collection<ClassicDataSourceType>[]>();
  const image360Collection = new Mock<Image360Collection<ClassicDataSourceType>>()
    .setup((x) => x.id)
    .returns('test-site-id')
    .setup((x) => x.setModelTransformation)
    .returns(vi.fn())
    .setup((x) => x.set360IconCullingRestrictions)
    .returns(vi.fn())
    .object();

  const renderTargetMock = new Mock<RevealRenderTarget>()
    .setup((x) => x.viewer)
    .returns(
      new Mock<Cognite3DViewer>()
        .setup((x) => x.models)
        .returns([])
        .setup((x) => x.get360ImageCollections)
        .returns(() => collectionsGetter())
        .object()
    );

  beforeEach(() => {
    deps.useRenderTarget.mockReturnValue(renderTargetMock.object());

    deps.useRevealKeepAlive.mockReturnValue({
      renderTargetRef: { current: renderTargetMock.object() },
      isRevealContainerMountedRef: { current: true },
      sceneLoadedRef: { current: undefined }
    });

    deps.useReveal3DResourcesCount.mockReturnValue({
      reveal3DResourcesCount: 0,
      setRevealResourcesCount: vi.fn()
    });

    deps.useReveal3DResourceLoadFailCount.mockReturnValue({
      reveal3DResourceLoadFailCount: 0,
      setReveal3DResourceLoadFailCount: vi.fn()
    });

    deps.createImage360CollectionDomainObject.mockResolvedValue(image360Collection);
    collectionsGetter.mockReturnValue([]);

    vi.spyOn(useApply360AnnotationStylingModule, 'useApply360AnnotationStyling').mockImplementation(() => {});
  });


  it('should properly add and remove Image360 Collection when mounting and unmounting Image360CollectionContainer', async () => {
    const addImage360CollectionOptions: AddImage360CollectionOptions = {
      source: 'events',
      siteId: 'test-site-id'
    };

    const { unmount } = render(
      <Image360CollectionContainer
        addImage360CollectionOptions={addImage360CollectionOptions}
        onLoad={vi.fn()}
      />,
      { wrapper }
    );

    await waitFor(() => {
      expect(deps.createImage360CollectionDomainObject).toHaveBeenCalled();
    });

    collectionsGetter.mockReturnValue([image360Collection]);

    unmount();

    await waitFor(() => {
      expect(deps.removeImage360CollectionDomainObject).toHaveBeenCalled();
    });
  });


  it.each([undefined, false, true])(
    'should propagate defaultVisible flag %s to `createImage360CollectionDomainObject`',
    async (defaultVisibleFlag) => {
      const addImage360CollectionOptions: AddImage360CollectionOptions = {
        source: 'events',
        siteId: 'test-site-id'
      };

      render(
        <Image360CollectionContainer
          addImage360CollectionOptions={addImage360CollectionOptions}
          onLoad={vi.fn()}
          defaultVisible={defaultVisibleFlag}
        />,
        { wrapper }
      );

      await waitFor(() => {
        expect(deps.createImage360CollectionDomainObject).toHaveBeenCalledWith(
          renderTargetMock.object(),
          addImage360CollectionOptions,
          defaultVisibleFlag
        );
      });
    }
  );
});