/*!
 * Copyright 2024 Cognite AS
 */
import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RevealCanvas, RevealContext } from '../../../src';
import { It, Mock } from 'moq.ts';
import { type CogniteClient } from '@cognite/sdk';
import { RevealKeepAliveContext } from '../../../src/components/RevealKeepAlive/RevealKeepAliveContext';
import { type Cognite3DViewer } from '@cognite/reveal';
import { type FC, useRef } from 'react';
import { type FdmNodeCache } from '../../../src/components/CacheProvider/FdmNodeCache';
import { type AssetMappingCache } from '../../../src/components/CacheProvider/AssetMappingCache';
import { type PointCloudAnnotationCache } from '../../../src/components/CacheProvider/PointCloudAnnotationCache';
import { type Image360AnnotationCache } from '../../../src/components/CacheProvider/Image360AnnotationCache';
import { type SceneIdentifiers } from '../../../src/components/SceneContainer/SceneTypes';

describe(RevealCanvas.name, () => {
  test('Mounting reveal container will mount a canvas to the DOM', () => {
    const MockedReveal: FC = () => {
      const sdkMock = new Mock<CogniteClient>()
        .setup(p => p.getBaseUrl())
        .returns('https://example.com')
        .setup(p => p.project)
        .returns('test');

      const domElement = document.createElement('div').appendChild(document.createElement('canvas'));

      const viewerRef = useRef<Cognite3DViewer>(
        new Mock<Cognite3DViewer>()
          .setup(p => p.domElement)
          .returns(domElement)
          .setup(p => {
            p.setBackgroundColor(It.IsAny());
          })
          .returns()
          .object()
      );
      const isRevealContainerMountedRef = useRef<boolean>(true);
      const sceneLoadedRef = useRef<SceneIdentifiers | undefined>();
      const fdmNodeCache = useRef<FdmNodeCache | undefined>();
      const assetMappingCache = useRef<AssetMappingCache | undefined>();
      const pointCloudAnnotationCache = useRef<PointCloudAnnotationCache>();
      const image360AnnotationCache = useRef<Image360AnnotationCache | undefined>();
      return (
        <RevealKeepAliveContext.Provider
          value={{
            viewerRef,
            isRevealContainerMountedRef,
            sceneLoadedRef,
            fdmNodeCache,
            assetMappingCache,
            pointCloudAnnotationCache,
            image360AnnotationCache
          }}
        >
          <RevealContext sdk={sdkMock.object()}>
            <RevealCanvas />
          </RevealContext>
        </RevealKeepAliveContext.Provider>
      );
    };
    const { container, rerender } = render(<MockedReveal />);
    rerender(<MockedReveal />);
    expect(container.querySelector('canvas')).not.toBeNull();
    screen.debug();
  });
});
