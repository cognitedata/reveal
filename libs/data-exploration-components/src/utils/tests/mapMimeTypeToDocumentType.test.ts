import { DOCUMENT_ICON_FALLBACK_VALUE } from '@data-exploration-lib/core';

import { mapMimeTypeToDocumentType } from '../mapMimeTypeToDocumentType';

describe('mapMimeTypeToDocumentType', () => {
  it('should return fallback value with undefine mime type', () => {
    expect(mapMimeTypeToDocumentType()).toEqual(DOCUMENT_ICON_FALLBACK_VALUE);
  });

  it('should return expected value', () => {
    expect(mapMimeTypeToDocumentType('image/png')).toEqual('file.png');
  });

  it('should return fallback value with non-existing mime type', () => {
    expect(mapMimeTypeToDocumentType('test/value')).toEqual(
      DOCUMENT_ICON_FALLBACK_VALUE
    );
  });
});
