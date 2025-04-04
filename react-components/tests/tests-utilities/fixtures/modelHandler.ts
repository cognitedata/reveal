import { Mock } from 'moq.ts';
import { vi } from 'vitest';
import {
  type CadModelHandler,
  type PointCloudModelHandler,
  type Image360CollectionHandler
} from '../../../src/components/RevealToolbar/LayersButton/ModelHandler';

export function createCadHandlerMock(parameters?: {
  revisionId?: number;
  visible?: boolean;
}): CadModelHandler {
  const cadVisibleMock = vi.fn<() => boolean>();
  cadVisibleMock.mockReturnValue(parameters?.visible ?? true);

  const setCadVisibilityMock = vi.fn().mockImplementation((visible: boolean) => {
    cadVisibleMock.mockReturnValue(visible);
  });

  return new Mock<CadModelHandler>()
    .setup((p) => p.getRevisionId)
    .returns(() => parameters?.revisionId ?? 456)
    .setup((p) => p.visible)
    .returns(() => cadVisibleMock())
    .setup((p) => p.setVisibility)
    .returns(setCadVisibilityMock)
    .setup((p) => p.key)
    .returns(() => 'cad')
    .setup((p) => p.isSame)
    .returns(() => true)
    .object();
}

export function createPointCloudHandlerMock(parameters?: {
  revisionId?: number;
  visible?: boolean;
}): PointCloudModelHandler {
  const pointCloudVisibleMock = vi.fn<() => boolean>();
  pointCloudVisibleMock.mockReturnValue(parameters?.visible ?? true);

  const setPointCloudVisibilityMock = vi.fn().mockImplementation((visible: boolean) => {
    pointCloudVisibleMock.mockReturnValue(visible);
  });
  return new Mock<PointCloudModelHandler>()
    .setup((p) => p.getRevisionId)
    .returns(() => parameters?.revisionId ?? 123)
    .setup((p) => p.visible)
    .returns(() => pointCloudVisibleMock())
    .setup((p) => p.setVisibility)
    .returns(setPointCloudVisibilityMock)
    .setup((p) => p.key)
    .returns(() => 'pointcloud')
    .setup((p) => p.isSame)
    .returns(() => true)
    .object();
}

export function createImage360HandlerMock(parameters?: {
  siteId?: string;
  visible?: boolean;
}): Image360CollectionHandler {
  const image360VisibleMock = vi.fn<() => boolean>();
  image360VisibleMock.mockReturnValue(parameters?.visible ?? true);

  const setImage360VisibilityMock = vi.fn().mockImplementation((visible: boolean) => {
    image360VisibleMock.mockReturnValue(visible);
  });
  return new Mock<Image360CollectionHandler>()
    .setup((p) => p.getSiteId)
    .returns(() => parameters?.siteId ?? 'site-id')
    .setup((p) => p.visible)
    .returns(() => image360VisibleMock())
    .setup((p) => p.setVisibility)
    .returns(setImage360VisibilityMock)
    .setup((p) => p.key)
    .returns(() => 'image360')
    .setup((p) => p.isSame)
    .returns(() => true)
    .object();
}
