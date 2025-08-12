import {
  BufferGeometry,
  Color,
  Group,
  Material,
  Object3D,
  PerspectiveCamera,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer
} from 'three';
import { Overlay3DCollection } from './Overlay3DCollection';
import { OverlayInfo } from './OverlayCollection';
import { Overlay3D } from './Overlay3D';
import assert from 'assert';
import { Mock, It } from 'moq.ts';

describe(Overlay3DCollection.name, () => {
  const OVERLAY_INFOS: OverlayInfo<string>[] = [
    { position: new Vector3(0, 0, 0), content: 'content0', color: new Color(0, 1, 0) },
    { position: new Vector3(1, 1, 1), content: 'content1', color: new Color(0, 1, 0) }
  ];

  test('initializing with empty array creates empty collection', () => {
    const collection = new Overlay3DCollection([]);

    expect(collection.getOverlays()).toEqual([]);
  });

  test('initializing with array of infos constructs overlays with infos', () => {
    const collection = new Overlay3DCollection<string>(OVERLAY_INFOS);

    expect(collection.getOverlays().map(getOverlayInfo)).toEqual(OVERLAY_INFOS);

    expect(collection.getOverlays().every(overlay => overlay.getVisible())).toBeTrue();
  });

  test('calling setVisible sets point visibility', () => {
    const collection = new Overlay3DCollection(OVERLAY_INFOS);

    expect(collection.children[0].visible).toBeTrue();
    collection.setVisibility(false);

    expect(collection.children[0].visible).toBeFalse();
  });

  test('adding overlays on the fly appends to overlay list', () => {
    const collection = new Overlay3DCollection<string>([]);

    const newOverlayInfo: OverlayInfo<string> = {
      position: new Vector3(3, 2, 1),
      content: 'content2',
      color: new Color(3, 2, 1)
    };

    collection.addOverlays(OVERLAY_INFOS);
    collection.addOverlays([newOverlayInfo]);

    expect(collection.getOverlays().map(getOverlayInfo)).toEqual([...OVERLAY_INFOS, newOverlayInfo]);
  });

  test('removeOverlays deletes them from the overlay list', () => {
    const collection = new Overlay3DCollection<string>(OVERLAY_INFOS);

    collection.removeOverlays([collection.getOverlays()[0]]);

    expect(collection.getOverlays().map(getOverlayInfo)).toEqual([OVERLAY_INFOS[1]]);
  });

  test('removeAllOverlays removes all overlays', () => {
    const collection = new Overlay3DCollection<string>(OVERLAY_INFOS);

    collection.removeAllOverlays();

    expect(collection.getOverlays()).toEqual([]);
  });

  test('dispose disposes all points', () => {
    const collection = new Overlay3DCollection<string>(OVERLAY_INFOS);
    expect(collection.getOverlays()).toHaveLength(2);
    collection.dispose();
    expect(collection.getOverlays()).toHaveLength(0);
  });

  test('intersectOverlays hits overlay', () => {
    const collection = new Overlay3DCollection<string>(OVERLAY_INFOS);

    const camera = createPerspectiveCamera();
    const result = collection.intersectOverlays(new Vector2(0, 0), camera);
    assert(result !== undefined);
    expect(getOverlayInfo(result)).toEqual(OVERLAY_INFOS[0]);
  });

  test('running onBeforeRender corrects size, so that overlays far away are missed in intersection query', () => {
    const collection = new Overlay3DCollection<string>(OVERLAY_INFOS);

    const camera = createPerspectiveCamera();
    const resultBeforeResize = collection.intersectOverlays(new Vector2(0, 0.5), camera);

    expect(resultBeforeResize).toBeDefined();

    const RENDER_SIZE = 1024;

    // run onBeforeRender on bockPoints in `OverlayPointsObject`
    runOnBeforeRenderWithMocks(collection.children[0].children[0], RENDER_SIZE, camera);
    // run onBeforeRender on frontPoints in `OverlayPointsObject`
    runOnBeforeRenderWithMocks(collection.children[0].children[1], RENDER_SIZE, camera);

    const resultAfterResize = collection.intersectOverlays(new Vector2(0, 0.5), camera);
    expect(resultAfterResize).toBeUndefined();
  });
});

function createPerspectiveCamera(): PerspectiveCamera {
  const camera = new PerspectiveCamera(90, 1.0, 0.01, 100);
  camera.position.copy(new Vector3(0, 0, 2));
  camera.updateMatrixWorld();
  return camera;
}

function runOnBeforeRenderWithMocks(object: Object3D, renderSize: number, camera: PerspectiveCamera): void {
  const resolution = new Vector2(renderSize, renderSize);
  object.onBeforeRender(
    new Mock<WebGLRenderer>()
      .setup(p => p.getSize(It.IsAny()))
      .callback(({ args }) => args[0].copy(resolution))
      .setup(p => p.getDrawingBufferSize(It.IsAny()))
      .callback(({ args }) => args[0].copy(resolution))
      .setup(p => p.domElement)
      .returns(
        new Mock<HTMLCanvasElement>()
          .setup(p => p.clientWidth)
          .returns(renderSize)
          .object()
      )
      .object(),
    new Mock<Scene>().object(),
    camera,
    new Mock<BufferGeometry>().object(),
    new Mock<Material>().object(),
    new Mock<Group>().object()
  );
}

function getOverlayInfo<T>(overlay: Overlay3D<T>): OverlayInfo<T> {
  return { position: overlay.getPosition(), content: overlay.getContent(), color: overlay.getColor() };
}
