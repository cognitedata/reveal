/*!
 * Copyright 2025 Cognite AS
 */
import { Vector3 } from 'three';

import { readAnnotations } from './readAnnotations';
import { CoreDmImage360Properties } from './properties';

describe(readAnnotations.name, () => {
  const MOCK_SPACE = 'test-space';

  const mockImageProperties: CoreDmImage360Properties = {
    translationX: 0,
    translationY: 0,
    translationZ: 0,
    eulerRotationX: 0,
    eulerRotationY: 0,
    eulerRotationZ: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    front: { space: MOCK_SPACE, externalId: 'front-1' },
    back: { space: MOCK_SPACE, externalId: 'back-1' },
    left: { space: MOCK_SPACE, externalId: 'left-1' },
    right: { space: MOCK_SPACE, externalId: 'right-1' },
    top: { space: MOCK_SPACE, externalId: 'top-1' },
    bottom: { space: MOCK_SPACE, externalId: 'bottom-1' },
    collection360: { space: MOCK_SPACE, externalId: 'collection-1' },
    station360: { space: MOCK_SPACE, externalId: 'station-1' },
    takenAt: new Date('2025-01-01').getTime()
  };

  it('returns single polygon for version 1.0.0', () => {
    const data = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
    const result = readAnnotations('1.0.0', mockImageProperties, data);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(3);
    result[0].forEach(vector => {
      expect(vector).toBeInstanceOf(Vector3);
    });
  });

  it('returns single polygon for version 1.0.1', () => {
    const data = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
    const result = readAnnotations('1.0.1', mockImageProperties, data);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(3);
    result[0].forEach(vector => {
      expect(vector).toBeInstanceOf(Vector3);
    });
  });

  it('parses v2.0.0 format with single polygon', () => {
    const data = [3, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
    const result = readAnnotations('2.0.0', mockImageProperties, data);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(3);
    result[0].forEach(vector => {
      expect(vector).toBeInstanceOf(Vector3);
    });
  });

  it('parses v2.0.0 format with multiple polygons', () => {
    const data = [3, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 4, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4];
    const result = readAnnotations('2.0.0', mockImageProperties, data);

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(3);
    expect(result[1]).toHaveLength(4);
    result.forEach(polygon => {
      polygon.forEach(vector => {
        expect(vector).toBeInstanceOf(Vector3);
      });
    });
  });

  it('parses version greater than 2.0.0 format as version 2.0.0', () => {
    const data = [3, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 4, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4];
    const result = readAnnotations('9.9.9', mockImageProperties, data);

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(3);
    expect(result[1]).toHaveLength(4);
    result.forEach(polygon => {
      polygon.forEach(vector => {
        expect(vector).toBeInstanceOf(Vector3);
      });
    });
  });

  it('throws error for v2.0.0 with data length < 7', () => {
    const data = [3, 0.1, 0.2];
    expect(() => readAnnotations('2.0.0', mockImageProperties, data)).toThrow(
      'Invalid data, format version 2.0.0 requires at least 7 numbers'
    );
  });

  it('throws error for v2.0.0 with insufficient vertices', () => {
    const data = [1, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7];
    expect(() => readAnnotations('2.0.0', mockImageProperties, data)).toThrow(
      'Invalid data, number of vertices must be at least 3'
    );
  });

  it('throws error for v2.0.0 with out of bounds data', () => {
    const data = [10, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7];
    expect(() => readAnnotations('2.0.0', mockImageProperties, data)).toThrow('Invalid data, out of bounds');
  });
});
