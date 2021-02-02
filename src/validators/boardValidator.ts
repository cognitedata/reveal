import { Validator } from './types';

export const boardValidator: Validator = {
  title: {
    required: { message: 'Please, enter board title' },
  },
  type: {
    required: { message: 'Please, select board type' },
  },
  url: {
    required: { message: 'Please, enter board URL' },
    pattern: {
      value:
        '^(https?|http):\\/\\/?[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*(:[0-9]{1,5})?(\\/.*)?$',
      message: 'Invalid URL format',
    },
  },
  embedTag: {
    pattern: {
      value: '(?:<iframe[^>]*)(?:(?:\\/>)|(?:>.*?<\\/iframe>))',
      message: 'Invalid iframe tag',
    },
  },
  imageFile: {
    maxSize: { message: 'This image is too big. Please upload one under 1Mb' },
    mimeType: { message: 'For now we only allow image/jpeg and image/png' },
  },
};
