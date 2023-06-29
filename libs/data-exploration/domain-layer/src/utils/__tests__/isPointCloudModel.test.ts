import { OutputItem } from '../../threeD';
import { isPointCloudModel } from '../isPointCloudModel';

describe('isPointCloudModel', () => {
  it('returns false when given an empty array', () => {
    const outputs: OutputItem[] = [];
    const result = isPointCloudModel(outputs);
    expect(result).toBe(false);
  });

  it('returns false when none of the OutputItems have the format "ept-pointcloud"', () => {
    const outputs: OutputItem[] = [
      { format: 'some-other-format', version: 1, blobId: 123 },
      { format: 'another-format', version: 2, blobId: 456 },
    ];
    const result = isPointCloudModel(outputs);
    expect(result).toBe(false);
  });

  it('returns true when at least one of the OutputItems has the format "ept-pointcloud"', () => {
    const outputs: OutputItem[] = [
      { format: 'ept-pointcloud', version: 1, blobId: 123 },
      { format: 'some-other-format', version: 2, blobId: 456 },
    ];
    const result = isPointCloudModel(outputs);
    expect(result).toBe(true);
  });

  it('returns true when all of the OutputItems have the format "ept-pointcloud"', () => {
    const outputs: OutputItem[] = [
      { format: 'ept-pointcloud', version: 1, blobId: 123 },
      { format: 'ept-pointcloud', version: 2, blobId: 456 },
    ];
    const result = isPointCloudModel(outputs);
    expect(result).toBe(true);
  });
});
