import {
  PendingCogniteAnnotation,
  CURRENT_VERSION,
} from '@cognite/annotations';
import { selectAnnotationColor } from './CogniteFileViewerUtils';

const stubAnnotation = {
  label: 'sample',
  source: 'job:0',
  version: CURRENT_VERSION,
  status: 'unhandled',
  box: { xMin: 0, xMax: 0, yMin: 0, yMax: 0 },
} as PendingCogniteAnnotation;

describe('CogniteFileViewerUtils', () => {
  describe('selectAnnotationColor', () => {
    it('asset', () => {
      expect(
        selectAnnotationColor({ ...stubAnnotation, resourceType: 'asset' })
      ).toBeDefined();
    });
    it('file', () => {
      expect(
        selectAnnotationColor({ ...stubAnnotation, resourceType: 'file' })
      ).toBeDefined();
    });
    it('timeSeries', () => {
      expect(
        selectAnnotationColor({ ...stubAnnotation, resourceType: 'timeSeries' })
      ).toBeDefined();
    });
    it('sequence', () => {
      expect(
        selectAnnotationColor({ ...stubAnnotation, resourceType: 'sequence' })
      ).toBeDefined();
    });
    it('event', () => {
      expect(
        selectAnnotationColor({ ...stubAnnotation, resourceType: 'event' })
      ).toBeDefined();
    });
    it('selected', () => {
      expect(selectAnnotationColor({ ...stubAnnotation }, true)).toBeDefined();
    });
    it('default', () => {
      expect(selectAnnotationColor({ ...stubAnnotation })).toBeDefined();
    });
  });
});
