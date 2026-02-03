/*!
 * Copyright 2025 Cognite AS
 */

import { getFileIdentifiers } from './Cdf360ImageFileProvider';
import { Image360FileDescriptor } from '../types';

describe('Cdf360ImageFileProvider', () => {
  describe('getFileIdentifiers', () => {
    test('extracts internal id from descriptor with fileId', () => {
      const descriptors: Image360FileDescriptor[] = [
        { fileId: 123, face: 'front', mimeType: 'image/jpeg' },
        { fileId: 456, face: 'back', mimeType: 'image/jpeg' }
      ];

      const identifiers = getFileIdentifiers(descriptors);

      expect(identifiers).toHaveLength(2);
      expect(identifiers[0]).toEqual({ id: 123 });
      expect(identifiers[1]).toEqual({ id: 456 });
    });

    test('extracts externalId from descriptor with externalId', () => {
      const descriptors: Image360FileDescriptor[] = [
        { externalId: 'file-1', face: 'front', mimeType: 'image/jpeg' },
        { externalId: 'file-2', face: 'back', mimeType: 'image/png' }
      ];

      const identifiers = getFileIdentifiers(descriptors);

      expect(identifiers).toHaveLength(2);
      expect(identifiers[0]).toEqual({ externalId: 'file-1' });
      expect(identifiers[1]).toEqual({ externalId: 'file-2' });
    });

    test('extracts instanceId from descriptor with instanceId', () => {
      const descriptors: Image360FileDescriptor[] = [
        {
          instanceId: { space: 'my-space', externalId: 'instance-1' },
          face: 'front',
          mimeType: 'image/jpeg'
        },
        {
          instanceId: { space: 'my-space', externalId: 'instance-2' },
          face: 'back',
          mimeType: 'image/jpeg'
        }
      ];

      const identifiers = getFileIdentifiers(descriptors);

      expect(identifiers).toHaveLength(2);
      expect(identifiers[0]).toEqual({
        instanceId: { space: 'my-space', externalId: 'instance-1' }
      });
      expect(identifiers[1]).toEqual({
        instanceId: { space: 'my-space', externalId: 'instance-2' }
      });
    });

    test('handles mixed identifier types', () => {
      const descriptors: Image360FileDescriptor[] = [
        { fileId: 123, face: 'front', mimeType: 'image/jpeg' },
        { externalId: 'file-ext', face: 'back', mimeType: 'image/jpeg' },
        {
          instanceId: { space: 's', externalId: 'e' },
          face: 'left',
          mimeType: 'image/jpeg'
        }
      ];

      const identifiers = getFileIdentifiers(descriptors);

      expect(identifiers).toHaveLength(3);
      expect(identifiers[0]).toEqual({ id: 123 });
      expect(identifiers[1]).toEqual({ externalId: 'file-ext' });
      expect(identifiers[2]).toEqual({
        instanceId: { space: 's', externalId: 'e' }
      });
    });

    test('throws error for descriptor without any identifier', () => {
      const descriptors = [{ face: 'front', mimeType: 'image/jpeg' } as Image360FileDescriptor];

      expect(() => getFileIdentifiers(descriptors)).toThrow(
        'Invalid Image360FileDescriptor: must have fileId, externalId, or instanceId'
      );
    });

    test('handles empty array', () => {
      const descriptors: Image360FileDescriptor[] = [];
      const identifiers = getFileIdentifiers(descriptors);
      expect(identifiers).toHaveLength(0);
    });

    test('handles all six faces with same identifier type', () => {
      const faces: Array<'front' | 'back' | 'left' | 'right' | 'top' | 'bottom'> = [
        'front',
        'back',
        'left',
        'right',
        'top',
        'bottom'
      ];

      const descriptors: Image360FileDescriptor[] = faces.map((face, idx) => ({
        externalId: `file-${idx}`,
        face,
        mimeType: 'image/jpeg' as const
      }));

      const identifiers = getFileIdentifiers(descriptors);

      expect(identifiers).toHaveLength(6);
      identifiers.forEach((id, idx) => {
        expect(id).toEqual({ externalId: `file-${idx}` });
      });
    });
  });
});
