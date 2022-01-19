import { SeismicCube } from "@/SubSurface/Seismic/Data/SeismicCube";
import { getFulfilledTrace, getLineRange, traceRejected } from "@/__tests__/SubSurface/Seismic/mock";
import { Index3 } from "@/Core/Geometry/Index3";
import { MockCogniteSeismicClient } from '@/__tests__/utils';
import {Vector3} from "@/Core/Geometry/Vector3";
import {Index2} from "@/Core/Geometry/Index2";

const size = new Index3(10, 10, 10);
const origin = new Vector3(1,1,1);
const inc = new Vector3(1,1,1);
const fileId = 'id';
const seismicClient = new MockCogniteSeismicClient({api_url: 'test'});
let cube: SeismicCube;

describe('Seismic Cube', () => {
  beforeEach(() => {
    cube = new SeismicCube(size, origin, inc);
    jest.clearAllMocks();
  });

  test('should load cube with proper dimension', async () => {
    const lineRange = getLineRange();
    const i = lineRange.inline.max.value - lineRange.inline.min.value;
    const j = lineRange.xline.max.value - lineRange.xline.min.value;
    const k = 601;

    seismicClient.file.getLineRange.mockResolvedValueOnce(lineRange);
    seismicClient.volume.getTrace
      .mockRejectedValueOnce(traceRejected)
      .mockResolvedValueOnce(getFulfilledTrace(600))
      .mockRejectedValueOnce(traceRejected)
      .mockResolvedValueOnce(getFulfilledTrace(k));
    const loadedCube = await SeismicCube.loadCube(seismicClient, fileId);

    expect(loadedCube!.nodeSize).toEqual(new Index3(i + 1, j + 1, k + 1));
    expect(loadedCube!.fileId).toEqual(fileId);
  });
  test('should load cube with proper dimension in case of all rejected traces', async () => {
    const traceLength = 200;
    const lineRange = getLineRange(traceLength);
    const i = lineRange.inline.max.value - lineRange.inline.min.value;
    const j = lineRange.xline.max.value - lineRange.xline.min.value;

    seismicClient.file.getLineRange.mockResolvedValueOnce(lineRange);
    seismicClient.volume.getTrace
      .mockRejectedValueOnce(traceRejected)
      .mockRejectedValueOnce(traceRejected)
      .mockRejectedValueOnce(traceRejected)
      .mockRejectedValueOnce(traceRejected)
    const loadedCube = await SeismicCube.loadCube(seismicClient, fileId);

    expect(loadedCube!.nodeSize).toEqual(new Index3(i + 1, j + 1, traceLength + 1));
  });
  test('should call getTrace', async () => {
    cube.fileId = 'id';
    cube.client = seismicClient;
    cube.loadTrace(new Index2(1, 1));

    expect(seismicClient.volume.getTrace).toHaveBeenCalledTimes(1);
    expect(seismicClient.volume.getTrace).toHaveBeenCalledWith({id: fileId}, 1, 1);
  });
  test('should ignore getTrace call in case of fileId or client is not provided', async () => {
    const trace = await cube.loadTrace(new Index2(1, 1));

    expect(seismicClient.volume.getTrace).toHaveBeenCalledTimes(0);
    expect(trace).toEqual(null);
  });
});