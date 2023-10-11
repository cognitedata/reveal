import { VALID_MIME_TYPES } from '../../../constants/validMimeTypes';
import { MediaTypeOption } from '../../../modules/FilterSidePanel/types';

import {
  getAllValidMimeTypes,
  getValidMimeTypesByMediaType,
} from './mimeTypeUtils';

const allMimeTypes = VALID_MIME_TYPES.map((mimeType) => mimeType.type);

const imageMimeTypes = allMimeTypes.filter(
  (item) => item.search('image') !== -1
);
const videoMimeTypes = allMimeTypes.filter(
  (item) => item.search('video') !== -1
);

describe('Testing getAllValidMimeTypes fn', () => {
  it('Should return all the elements', () => {
    expect(getAllValidMimeTypes()).toEqual(
      expect.arrayContaining(allMimeTypes)
    );
  });
});

describe('Testing getValidMimeTypesByMediaType fn', () => {
  it('If mediaType undefined', () => {
    expect(getValidMimeTypesByMediaType(undefined)).toEqual(
      expect.arrayContaining(allMimeTypes)
    );
  });
  it('If option Image selected', () => {
    expect(getValidMimeTypesByMediaType(MediaTypeOption.image)).toEqual(
      expect.arrayContaining(imageMimeTypes)
    );
  });
  it('If option Video selected', () => {
    expect(getValidMimeTypesByMediaType(MediaTypeOption.video)).toEqual(
      expect.arrayContaining(videoMimeTypes)
    );
  });
});
