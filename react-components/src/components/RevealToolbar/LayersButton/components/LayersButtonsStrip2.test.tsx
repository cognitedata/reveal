import { render } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { LayersButtonProps } from '../LayersButton2';
import { defaultLayersButtonDependencies, LayersButtonContext } from '../LayersButton2.context';
import { viewerImage360CollectionsMock, viewerModelsMock } from '#test-utils/fixtures/viewer';
import { type CogniteModel } from '@cognite/reveal';
import { cadMock, createCadMock } from '#test-utils/fixtures/cadModel';
import { createImage360ClassicMock } from '#test-utils/fixtures/image360';
import { LayersButtonStrip } from './LayersButtonsStrip2';
import { type ReactNode, type ReactElement } from 'react';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import {
  CadDomainObject,
  Image360CollectionDomainObject,
  PointCloudDomainObject
} from '../../../../architecture';
import { createPointCloudMock } from '#test-utils/fixtures/pointCloud';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';

describe(LayersButtonStrip.name, () => {
  const CAD_REVISION_ID = 456;
  const POINT_CLOUD_REVISION_ID = 123;
  const IMAGE_360_COLLECTION_ID = 'site-id';

  const defaultProps = {
    layersState: {
      cadLayers: [{ revisionId: CAD_REVISION_ID, applied: true, index: 0 }],
      pointCloudLayers: [{ revisionId: POINT_CLOUD_REVISION_ID, applied: true, index: 0 }],
      image360Layers: [{ siteId: IMAGE_360_COLLECTION_ID, applied: true }]
    },
    setLayersState: vi.fn()
  } as const satisfies LayersButtonProps;

  const defaultDependencies = getMocksByDefaultDependencies(defaultLayersButtonDependencies);

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <LayersButtonContext.Provider value={defaultDependencies}>
      {children}
    </LayersButtonContext.Provider>
  );

  let cadObject: CadDomainObject;
  let pointCloudObject: PointCloudDomainObject;
  let image360Object: Image360CollectionDomainObject;

  beforeEach(() => {
    cadObject = new CadDomainObject(createCadMock({ revisionId: CAD_REVISION_ID }));
    pointCloudObject = new PointCloudDomainObject(
      createPointCloudMock({ revisionId: POINT_CLOUD_REVISION_ID })
    );
    image360Object = new Image360CollectionDomainObject(
      createImage360ClassicMock({ siteId: IMAGE_360_COLLECTION_ID })
    );
    defaultDependencies.useModelsVisibilityState.mockReturnValue({
      cadModels: [cadObject],
      pointClouds: [pointCloudObject],
      image360Collections: [image360Object]
    });
    defaultDependencies.useRenderTarget.mockReturnValue(createRenderTargetMock());
  });

  test('renders without crashing', () => {
    const mockModels: CogniteModel[] = [cadMock, cadMock];
    viewerModelsMock.mockReturnValue(mockModels);
    const mockImage360Collection = createImage360ClassicMock();
    viewerImage360CollectionsMock.mockReturnValue([mockImage360Collection]);

    const { getAllByRole } = render(<LayersButtonStrip {...defaultProps} />, {
      wrapper
    });

    expect(getAllByRole('img', { name: 'CubeIcon' })).toBeTruthy();
    expect(getAllByRole('img', { name: 'PointCloudIcon' })).toBeTruthy();
    expect(getAllByRole('img', { name: 'View360Icon' })).toBeTruthy();
  });

  test('renders with empty layersState', () => {
    const mockModels: CogniteModel[] = [cadMock, cadMock];
    viewerModelsMock.mockReturnValue(mockModels);
    const mockImage360Collection = createImage360ClassicMock();
    viewerImage360CollectionsMock.mockReturnValue([mockImage360Collection]);

    const { getAllByRole } = render(<LayersButtonStrip {...defaultProps} layersState={{}} />, {
      wrapper
    });

    expect(getAllByRole('img', { name: 'CubeIcon' })).toBeTruthy();
    expect(getAllByRole('img', { name: 'PointCloudIcon' })).toBeTruthy();
    expect(getAllByRole('img', { name: 'View360Icon' })).toBeTruthy();
  });
});
