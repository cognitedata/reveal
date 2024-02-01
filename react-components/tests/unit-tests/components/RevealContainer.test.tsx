import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RevealContainer } from '../../../src';
import { It, Mock } from 'moq.ts';
import { type CogniteClient } from '@cognite/sdk';
import { RevealKeepAliveContext } from '../../../src/components/RevealKeepAlive/RevealKeepAliveContext';
import { type Cognite3DViewer } from '@cognite/reveal';
import { type FC, useRef } from 'react';
import { type FdmNodeCache } from '../../../src/components/NodeCacheProvider/FdmNodeCache';
import { type AssetMappingCache } from '../../../src/components/NodeCacheProvider/AssetMappingCache';
import { type PointCloudAnnotationCache } from '../../../src/components/NodeCacheProvider/PointCloudAnnotationCache';

describe(RevealContainer.name, () => {
  test('Mounting reveal container will mount a canvas to the DOM', () => {
    const MockedReveal: FC = () => {
      const sdkMock = new Mock<CogniteClient>()
        .setup((p) => p.getBaseUrl())
        .returns('https://example.com')
        .setup((p) => p.project)
        .returns('test');

      const domElement = document
        .createElement('div')
        .appendChild(document.createElement('canvas'));

      const viewerRef = useRef<Cognite3DViewer>(
        new Mock<Cognite3DViewer>()
          .setup((p) => p.domElement)
          .returns(domElement)
          .setup((p) => {
            p.setBackgroundColor(It.IsAny());
          })
          .returns()
          .object()
      );
      const isRevealContainerMountedRef = useRef<boolean>(true);
      const fdmNodeCache = useRef<FdmNodeCache | undefined>();
      const assetMappingCache = useRef<AssetMappingCache | undefined>();
      const pointCloudObjectCollectionCache = useRef<PointCloudAnnotationCache>();
      return (
        <RevealKeepAliveContext.Provider
          value={{
            viewerRef,
            isRevealContainerMountedRef,
            fdmNodeCache,
            assetMappingCache,
            pointCloudAnnotationCache: pointCloudObjectCollectionCache
          }}>
          <RevealContainer sdk={sdkMock.object()} />
        </RevealKeepAliveContext.Provider>
      );
    };
    const { container } = render(<MockedReveal />);
    expect(container.querySelector('canvas')).not.toBeNull();
    screen.debug();
  });
});
