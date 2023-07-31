import { adaptSelectedPathToMetadataPath } from '../adaptSelectedPathToMetadataPath';

describe('adaptSelectedPathToMetadataPath', () => {
  test('should inject selected path with children keyword at each level for accessing nested metadata', () => {
    expect(adaptSelectedPathToMetadataPath('wells.trajectory.enabled')).toBe(
      'wells.children.trajectory.children.enabled'
    );
  });
  test('should replace number accessor with children for accessing dataAsChildren metadata', () => {
    expect(adaptSelectedPathToMetadataPath('map.layers.0.filters')).toBe(
      'map.children.layers.children.filters'
    );
  });
  test('should return empty string when selected path is empty', () => {
    expect(adaptSelectedPathToMetadataPath('')).toBe('');
  });
  test('should return empty path when no path is sent', () => {
    expect(adaptSelectedPathToMetadataPath()).toBe('');
  });
});
